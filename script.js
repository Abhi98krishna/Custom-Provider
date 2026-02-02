const tocItems = [
  {
    id: "context",
    label: "CONTEXT",
    sub: [
      { id: "nutanix", label: "Nutanix" },
      { id: "self-service", label: "Self Service" },
      { id: "the-gap", label: "The Gap" },
      { id: "business-problem", label: "Problems and Goals" },
    ],
  },
  {
    id: "the-solution",
    label: "THE SOLUTION",
    sub: [
      { id: "custom-provider", label: "Custom Provider" },
      { id: "my-role", label: "My Role" },
      { id: "impact", label: "Impact" },
    ],
  },
  {
    id: "design",
    label: "DESIGN",
    sub: [
      { id: "ux-problems", label: "UX Problems" },
      { id: "evolutions", label: "Evolutions" },
    ],
  },
  {
    id: "process",
    label: "PROCESS",
    sub: [
      { id: "stakeholders", label: "Stakeholders" },
      { id: "understanding", label: "Understanding" },
      { id: "maps-to-flows", label: "Maps to Flows" },
      { id: "iterations", label: "Iterations" },
      { id: "feedback", label: "Feedback" },
      { id: "snippets", label: "Snippets" },
    ],
  },
  {
    id: "glossary",
    label: "GLOSSARY",
  },
];

const select = document.getElementById("case-study-toc-select");
const tocAnchors = Array.from(document.querySelectorAll("[data-toc-id]"));
const anchorMap = new Map(tocAnchors.map((anchor) => [anchor.dataset.tocId, anchor]));

const flatIds = tocItems.flatMap((item) => [item.id, ...(item.sub?.map((sub) => sub.id) ?? [])]);

const buildSelect = () => {
  if (!select) {
    return;
  }

  tocItems.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.label;
    select.appendChild(option);

    item.sub?.forEach((sub) => {
      const subOption = document.createElement("option");
      subOption.value = sub.id;
      subOption.textContent = `${item.label}: ${sub.label}`;
      select.appendChild(subOption);
    });
  });
};

const scrollToId = (id) => {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }
  element.scrollIntoView({ behavior: "smooth", block: "start" });
};

const setActive = (id) => {
  tocAnchors.forEach((anchor) => {
    const isActive = anchor.dataset.tocId === id;
    anchor.classList.toggle("is-active", isActive);
    if (isActive) {
      anchor.setAttribute("aria-current", "true");
    } else {
      anchor.removeAttribute("aria-current");
    }
  });

  if (select) {
    select.value = id;
  }

  // Highlight parent section if a subitem is active.
  const parent = tocItems.find((item) => item.id === id || item.sub?.some((sub) => sub.id === id));
  if (parent && parent.id !== id) {
    const parentAnchor = anchorMap.get(parent.id);
    if (parentAnchor) {
      parentAnchor.classList.add("is-active");
      parentAnchor.setAttribute("aria-current", "true");
    }
  }
};

buildSelect();

if (select) {
  select.addEventListener("change", (event) => {
    const id = event.target.value;
    scrollToId(id);
    setActive(id);
  });
}

tocAnchors.forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    event.preventDefault();
    const id = anchor.dataset.tocId;
    if (id) {
      scrollToId(id);
      setActive(id);
    }
  });
});

const elements = flatIds
  .map((id) => document.getElementById(id))
  .filter((element) => Boolean(element));

if (elements.length > 0) {
  const entriesRef = new Map();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entriesRef.set(entry.target.id, entry);
      });

      const visible = Array.from(entriesRef.values())
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        setActive(visible[0].target.id);
      }
    },
    {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0.1, 0.35, 0.6],
    },
  );

  elements.forEach((element) => observer.observe(element));
}

const rotators = [
  { key: "builder", selector: ".builder-rotator", frameSelector: ".builder-frame", count: 3 },
  { key: "wizard", selector: ".wizard-rotator", frameSelector: ".wizard-frame", count: 4 },
  { key: "onboarding", selector: ".onboarding-rotator", frameSelector: ".onboarding-frame", count: 16 },
  { key: "edit", selector: ".edit-rotator", frameSelector: ".edit-frame", count: 5 },
  { key: "evolution", selector: ".evolution-rotator", frameSelector: ".evolution-frame", count: 6 },
  {
    key: "understanding",
    selector: ".understanding-rotator",
    frameSelector: ".understanding-frame",
    count: 4,
  },
  { key: "flows", selector: ".flows-rotator", frameSelector: ".flows-frame", count: 4 },
];

const rotatorState = new Map();

const setManualFrame = (container, frames, index) => {
  container.classList.add("rotator-manual");
  frames.forEach((frame, i) => {
    frame.style.opacity = i === index ? "1" : "0";
  });
};

const setPaused = (container, frames, controls, paused) => {
  frames.forEach((frame) => {
    frame.classList.toggle("rotator-paused", paused);
    frame.style.animationPlayState = paused ? "paused" : "running";
  });
  const toggle = controls?.querySelector("[data-action=\"toggle\"]");
  if (toggle) {
    toggle.setAttribute("aria-label", paused ? "Play" : "Pause");
    toggle.classList.toggle("is-paused", paused);
  }
};

const rotatorMap = new Map();

rotators.forEach(({ key, selector, frameSelector, count }) => {
  const container = document.querySelector(selector);
  if (!container) {
    return;
  }

  const frames = Array.from(container.querySelectorAll(frameSelector));
  const controls = document.querySelector(`.rotator-controls[data-rotator=\"${key}\"]`);
  if (!controls || frames.length === 0) {
    return;
  }

  frames.forEach((frame) => {
    frame.style.pointerEvents = "none";
  });

  const total = frames.length || count;
  rotatorState.set(key, { index: 0, paused: false });
  rotatorMap.set(key, { container, frames, controls, total });

  const handleAction = (action) => {
    const state = rotatorState.get(key);
    if (!state) {
      return;
    }

    if (action === "toggle") {
      state.paused = !state.paused;
      if (!state.paused) {
        container.classList.remove("rotator-manual");
        frames.forEach((frame) => {
          frame.style.opacity = "";
        });
      }
      setPaused(container, frames, controls, state.paused);
      rotatorState.set(key, state);
      return;
    }

    state.paused = true;
    if (action === "prev") {
      state.index = (state.index - 1 + total) % total;
    } else if (action === "next") {
      state.index = (state.index + 1) % total;
    }

    setPaused(container, frames, controls, true);
    setManualFrame(container, frames, state.index);
    rotatorState.set(key, state);
  };
  // Document-level handler manages all rotator controls to avoid duplicate toggles.
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".rotator-controls button");
  if (!button) {
    return;
  }
  event.preventDefault();
  const controls = button.closest(".rotator-controls");
  const key = controls?.dataset.rotator;
  if (!key) {
    return;
  }
  const data = rotatorMap.get(key);
  if (!data) {
    return;
  }

  const state = rotatorState.get(key) || { index: 0, paused: false };
  const action = button.dataset.action;

  if (action === "toggle") {
    state.paused = !state.paused;
    if (!state.paused) {
      data.container.classList.remove("rotator-manual");
      data.frames.forEach((frame) => {
        frame.style.opacity = "";
      });
    }
    setPaused(data.container, data.frames, data.controls, state.paused);
    rotatorState.set(key, state);
    return;
  }

  state.paused = true;
  if (action === "prev") {
    state.index = (state.index - 1 + data.total) % data.total;
  } else if (action === "next") {
    state.index = (state.index + 1) % data.total;
  }
  setPaused(data.container, data.frames, data.controls, true);
  setManualFrame(data.container, data.frames, state.index);
  rotatorState.set(key, state);
});
