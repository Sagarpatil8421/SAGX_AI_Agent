'use client';

import { useState, useRef } from 'react';

export function useVoiceAssistant() {
  const [content, setContent] = useState('Click the mic and speak...');
  const [todoList, setTodoList] = useState([]);

  const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  const recognition =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
      ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
      : null;

  if (recognition) {
    recognition.onstart = () => {
      setContent('Listening...');
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setContent(`You said: ${transcript}`);

      if (transcript.includes('weather') || transcript.includes('temperature')) {
        getWeather(transcript);
      } else if (
        transcript.includes('joke') || transcript.includes('make me laugh')
      ) {
        tellJoke();
      } else if (
        transcript.includes('add') &&
        (transcript.includes('to-do list') || transcript.includes('to do list') || transcript.includes('todo'))
      ) {
        addToTodoList(transcript);
      } else if (
        transcript.includes('show') &&
        (transcript.includes('to-do list') || transcript.includes('to do list') || transcript.includes('todo'))
      ) {
        showTodoList();
      } else if (
        transcript.includes('clear') &&
        (transcript.includes('to-do list') || transcript.includes('to do list') || transcript.includes('todo'))
      ) {
        clearTodoList();
      } else if ((transcript.includes('activate') || transcript.includes('turn on')) && transcript.includes('dark mode')) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        speak('Dark mode activated.');
      } else if ((transcript.includes('activate') || transcript.includes('turn on')) && transcript.includes('light mode')) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        speak('Light mode activated.');
      } else if (transcript.includes('open')) {
        openWebsiteOrApp(transcript);
      } else {
        getAIResponse(transcript);
      }
    };
  }

  const handleClick = () => {
    if (recognition) {
      recognition.start();
    } else {
      setContent('Speech recognition not supported.');
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setContent(text);
  };

  const getWeather = async (command) => {
    const locationMatch = command.match(/in (.+)/);
    let location = locationMatch ? locationMatch[1].trim() : 'Mumbai';
    location = location.replace(/\btoday\b/gi, '').trim();

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          location
        )}&units=metric&APPID=${WEATHER_API_KEY}`
      );
      if (!response.ok) throw new Error('Weather API Error');

      const data = await response.json();
      const weatherInfo = `The weather in ${data.name} is ${data.main.temp}°C with ${data.weather[0].description}.`;
      speak(weatherInfo);
    } catch (error) {
      console.error('Weather API Error:', error);
      speak("I couldn't fetch the weather information.");
    }
  };

  const tellJoke = async () => {
    try {
      const response = await fetch("https://v2.jokeapi.dev/joke/Programming,Misc,Pun?safe-mode&type=single");
      const data = await response.json();
      const joke = data.joke || "Sorry, I couldn't find a good joke right now.";
      speak(joke);
    } catch (error) {
      console.error("Joke API error:", error);
      speak("Oops, I can't tell a joke right now.");
    }
  };

  const addToTodoList = (command) => {
    let task = command
      .replace(/^(add|put|insert)\s+/i, '')
      .replace(/\b(to|in)?\s*(my)?\s*(to[- ]?do|todo)\s*list\b/gi, '')
      .trim();

    if (task) {
      setTodoList((prev) => [...prev, task]);
      speak(`Added ${task} to your to-do list.`);
    } else {
      speak("Sorry, I couldn't understand the task to add.");
    }
  };

  const showTodoList = () => {
    if (todoList.length === 0) {
      speak('Your to-do list is empty.');
    } else {
      speak('Your to-do list contains: ' + todoList.join(', '));
    }
  };

  const clearTodoList = () => {
    setTodoList([]);
    speak('Your to-do list has been cleared.');
  };

  const openWebsiteOrApp = (command) => {
    const sites = [
      { name: 'google', url: 'https://www.google.com' },
      { name: 'youtube', url: 'https://www.youtube.com' },
      { name: 'instagram', url: 'https://www.instagram.com' },
      { name: 'github', url: 'https://www.github.com' },
      { name: 'twitter', url: 'https://www.twitter.com' },
      { name: 'calculator', url: 'https://www.calculatorsoup.com/', customMessage: 'Opening an online calculator.' },
    ];

    let found = false;
    for (const site of sites) {
      if (command.includes(site.name)) {
        speak(site.customMessage || `Opening ${site.name}.`);
        window.open(site.url, '_blank');
        found = true;
        break;
      }
    }

    if (!found) {
      speak("I am not sure how to open that. I will improve myself but currently searching it on Google for you.");
      window.open(`https://www.google.com/search?q=${encodeURIComponent(command)}`, '_blank');
    }
  };

  const getAIResponse = async (userInput) => {
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(userInput)}&format=json&no_redirect=1&skip_disambig=1`
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      let reply = data.AbstractText || data.Answer || '';

      if (!reply && data.RelatedTopics?.length > 0) {
        const topic = data.RelatedTopics.find((t) => t.Text);
        reply = topic ? topic.Text : '';
      }

      if (reply.length > 120) {
        reply = reply.split('. ').slice(0, 1).join('. ') + '.';
      }

      if (!reply || reply.trim() === '') {
        speak("I couldn't find the answer, but I am searching it on Google for you.");
        window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank');
      } else {
        speak(reply);
      }
    } catch (error) {
      console.error('AI Response Error:', error);
      speak('Sorry, I am having trouble responding right now.');
    }
  };

  return { handleClick, content };
}
  