# EventFlow AI

An AI-assisted event planning and registration system for organizations that run workshops, classes, community events, training sessions, appointments, fundraisers, and volunteer events.

## Problem

Organizations still manage events through spreadsheets and email, causing overbooking, missed reminders, poor waitlist tracking, and no-shows.

## Solution

EventFlow AI helps organizers manage the full event lifecycle from creation to completion. It controls capacity, manages waitlists, sends automated notifications, and uses AI to assist with event messaging and planning decisions.

**Target audience:** small organizations, nonprofits, schools, clubs, and businesses that need structure without a full enterprise event platform.

## Core Entities

| Record Type | Purpose |
|---|---|
| Events | Stores event details such as name, date, location, capacity, status |
| Attendees | Stores participant information such as name, email, phone |
| Registrations | Connects attendees to events and tracks registration status |
| Notifications *(optional)* | Tracks confirmations, reminders, cancellations, and waitlist notices |

## Event Status

| Status | Meaning |
|---|---|
| Draft | Event created but not open for registration |
| Open | People can register |
| Full | Capacity reached |
| Waitlisted | Capacity full, but waitlist is active |
| Closed | Registration is no longer allowed |
| Completed | Event has already occurred |
| Canceled | Event will not happen |

## Registration Status

| Status | Meaning |
|---|---|
| Confirmed | Attendee has a reserved spot |
| Waitlisted | Attendee is waiting for an opening |
| Canceled | Attendee canceled |
| Promoted | Attendee moved from waitlist to confirmed |
| Attended | Attendee checked in |
| No-show | Attendee registered but did not attend |

## Business Rules

**Capacity enforcement:** once an event reaches its seat limit, new registrants are placed on a waitlist and the event status changes to Full or Waitlisted.

**Automatic waitlist promotion:** when a confirmed attendee cancels, the first person on the waitlist is promoted to Confirmed and notified.

Optional additional rules under consideration: registration closes 24 hours before the event, reminders sent 24 hours before the event, no duplicate registrations per attendee/event, and events cannot be edited after completion.

## Notifications

Automated notifications (registration confirmation, waitlist confirmation, waitlist promotion, event reminder, cancellation notice) via an external provider such as SendGrid, Resend, or the Gmail API.

## AI Features

- Generate event descriptions
- Suggest reminder messages
- Create post-event follow-up emails
- Summarize registration trends
- Flag events likely to exceed capacity
- Recommend whether to open a second session (e.g. "Based on current registrations and waitlist size, suggest whether the organizer should add another session.")

## Status

This project is in the planning stage; implementation has not yet started.
