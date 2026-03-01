/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — UI/UX A/B Experiments
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Experiment } from "@/lib/experiments/experiment-service";

export const uiExperiments: Experiment[] = [
  {
    id: "ui_discovery_layout",
    name: "Discovery Feed: Card Stack vs Grid",
    description:
      "Test whether the vertical card-stack (Tinder-style) or a 2-column grid drives more likes per session.",
    hypothesis:
      "Card stack produces 30% more likes per session because users focus on one profile at a time (reduced choice paralysis).",
    primaryMetric: "interest_sent",
    secondaryMetrics: ["profiles_viewed", "session_duration_sec", "match_rate_d7"],
    variants: [
      { id: "control", name: "Card stack (one at a time)", weight: 50, value: "stack" },
      { id: "variant_a", name: "Two-column grid", weight: 50, value: "grid" },
    ],
    status: "running",
    startDate: "2026-02-18",
    endDate: null,
    minSamplePerVariant: 1000,
    owner: "design",
    tags: ["ui", "discovery", "layout"],
    audience: "all",
  },
  {
    id: "ui_cta_copy",
    name: "Like Button CTA Copy",
    description:
      "Test the label on the primary action button in the discovery feed.",
    hypothesis:
      "'Interested' (softer, marriage-appropriate) converts 10% better than '❤️ Like' (casual dating connotation) for Indian users.",
    primaryMetric: "interest_sent",
    secondaryMetrics: ["match_rate_d7", "message_sent_d7"],
    variants: [
      { id: "control", name: "❤️ Like", weight: 33, value: { label: "Like", icon: "heart" } },
      { id: "variant_a", name: "✓ Interested", weight: 34, value: { label: "Interested", icon: "check" } },
      { id: "variant_b", name: "🤝 Connect", weight: 33, value: { label: "Connect", icon: "handshake" } },
    ],
    status: "running",
    startDate: "2026-02-20",
    endDate: null,
    minSamplePerVariant: 1000,
    owner: "design",
    tags: ["ui", "copy", "cta"],
    audience: "all",
  },
  {
    id: "ui_profile_modal_depth",
    name: "Profile Detail: Accordion vs Full-scroll",
    description:
      "Test whether collapsing secondary profile info into accordions increases time-on-profile and like quality.",
    hypothesis:
      "Accordion layout produces 15% higher match rate because users who expand sections are more intentional.",
    primaryMetric: "match_rate_d7",
    secondaryMetrics: ["profile_view_duration_sec", "interest_sent", "appreciation_sent"],
    variants: [
      { id: "control", name: "Full-scroll (all info visible)", weight: 50, value: "full_scroll" },
      { id: "variant_a", name: "Accordion (expand to reveal)", weight: 50, value: "accordion" },
    ],
    status: "draft",
    startDate: "2026-03-05",
    endDate: null,
    minSamplePerVariant: 800,
    owner: "design",
    tags: ["ui", "profile", "layout"],
    audience: "all",
  },
  {
    id: "ui_safety_button_position",
    name: "Safety Button: Bottom-right vs Top-bar",
    description:
      "Test whether moving the safety button from a floating bottom-right position to the top navigation bar increases usage.",
    hypothesis:
      "Top-bar placement increases safety button usage by 40% because it's always visible and perceived as a core feature, not an afterthought.",
    primaryMetric: "safety_button_pressed",
    secondaryMetrics: ["safety_report_submitted", "user_satisfaction"],
    variants: [
      { id: "control", name: "Floating bottom-right (current)", weight: 50, value: "bottom_right" },
      { id: "variant_a", name: "Fixed in top navigation bar", weight: 50, value: "top_bar" },
    ],
    status: "running",
    startDate: "2026-02-25",
    endDate: null,
    minSamplePerVariant: 500,
    owner: "safety",
    tags: ["ui", "safety", "position"],
    audience: "all",
  },
  {
    id: "ui_icebreaker_style",
    name: "Icebreaker Suggestions: Chips vs Carousel",
    description:
      "Test whether horizontally scrollable chips or a swipeable carousel of icebreaker prompts drives more first messages.",
    hypothesis:
      "Chips drive 20% more first messages because users see all options at once — carousel hides options behind a swipe.",
    primaryMetric: "first_message_sent",
    secondaryMetrics: ["icebreaker_tapped", "message_response_rate"],
    variants: [
      { id: "control", name: "Horizontal chip scroll", weight: 50, value: "chips" },
      { id: "variant_a", name: "Swipeable card carousel", weight: 50, value: "carousel" },
    ],
    status: "draft",
    startDate: "2026-03-10",
    endDate: null,
    minSamplePerVariant: 800,
    owner: "product",
    tags: ["ui", "chat", "icebreaker"],
    audience: "all",
  },
];
