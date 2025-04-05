# Nuxt UI Timepicker

A beautiful time picker for Nuxt 3 apps using [Nuxt UI](https://ui.nuxt.com) and [Culori](https://culorijs.org).

## ✨ Features

This module consists of three nuxt-ui based components for getting a reusable TimePicker:

- `TimePicker.vue`: A button-icon with popup-based time picker with emitting and receiving an hourMinute object: {hour: number, minute: number}
- `InputTimePicker.vue`: Input field with time string in v-model (`HH:MM`)
- `ClockDial.vue`: Reusable clock dial canvas (used internally by TimePicker and InputTimePicker) - can be used for making your own version of a TimePicker
- culori is used to get the primary color from the nuxt-ui settings.
- Fully styled with Nuxt UI components
- Supports dark mode
- MIT licensed

## 📦 Installation

```bash
npm install nuxt-ui-timepicker
```

## Playground

- Contains a simple app that shows the usage of the TimePickers.

## Inspired by a jquery plugin

I did a remake of this MIT licensed jquery plugin, imitating the visuals but making the controller from zero: [Clock Timepicker Plugin for jQuery](https://github.com/loebi-ch/jquery-clock-timepicker)

