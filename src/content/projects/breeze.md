---
title: Breeze
order: 4
summary: Smartwatch app for marine safety and fishing, built by a team of three. I worked on the Apple Watch app in Swift.
meta: '3rd place · DIVE 2025'
highlight: true
lede: 'A smartwatch app for people at sea: an emergency call from a triple tap, live tide and weather, and AI fishing advice. Built for the DIVE 2025 hackathon with two uni mates.'
facts:
  - label: result
    value: 3rd place, Coastal Big Data Platform track
  - label: event
    value: DIVE 2025 Global Data Hackathon, Busan
  - label: my role
    value: Swift developer, Apple Watch app
  - label: platforms
    value: watchOS and Wear OS
links:
  - label: source on github
    url: https://github.com/yamazhen/DIVE2025
say: third place. there were fish involved.
---

## 01 · the problem

### At sea, a watch is easier to reach than a phone.

On a boat or a pier, a phone is often in a bag or a pocket, and hands are wet or busy. A watch is always on the wrist. Breeze puts safety and fishing information there, for fishermen, divers and anyone else out on the water.

We built it at DIVE 2025, a global data hackathon in Busan, for the coastal big data platform track: teams had to build something useful from coastal and marine data.

## 02 · what it does

### Safety first, fishing second.

- **Emergency call.** Tapping the screen three times in quick succession calls 112, Korea's emergency number. The watch also reads the wearer's heart rate and blood pressure from Apple Health.
- **Alerts.** Warnings for bad weather and typhoons, using typhoon data from the Korea Meteorological Administration.
- **Fishing advice.** The watch sends the current conditions to Google's Gemini AI model, which scores them from 0 to 10 for fishing, suggests which fish to target and the best times of day, and recommends spots. The answer comes back in a fixed format the watch can display directly.
- **Cards.** Swipeable screens for tide times, with the moon phase and a tide graph, for marine weather, and for nearby fishing spots with their depth and seabed type.

## 03 · my part

### The Apple Watch app, in SwiftUI.

We were three uni mates. Two of us built the Apple Watch app in Swift with SwiftUI, Apple's framework for building interfaces, and our third teammate built the Android watch version (Wear OS) in Kotlin on his own.

On the Apple Watch app, I built:

- location tracking and the navigation between cards
- the tide card, including the tide graph
- the weather and typhoon alerts
- the triple-tap emergency call and the health readings
- the AI fishing advice

My teammate built the weather and fishing spot cards.

## 04 · result

### Third place.

Breeze took third place in the coastal big data platform track at DIVE 2025.

![The three of us on stage at DIVE 2025 in Busan, holding the third-place sign for the coastal big data platform track.](../../images/breeze-third-place.jpeg)

<p class="caption">Third place at DIVE 2025, Busan.</p>
