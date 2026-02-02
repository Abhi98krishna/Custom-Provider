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
    sub: [{ id: "ux-problems", label: "UX Problems" }],
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
