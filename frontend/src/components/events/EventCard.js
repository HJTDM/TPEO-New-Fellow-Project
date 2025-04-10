import React, { useState, useLayoutEffect, useRef } from "react";
import "../../styles/events/EventCard.css";
import { academicTags, socialTags, careerTags } from '../../constants/categories';

function EventCard({ event, currentUser, onToggleSave }) {
  const [isSaved, setIsSaved] = useState(false);
  const tagsContainerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(event.categories.length);

  // Check if event is saved
  React.useEffect(() => {
    if (currentUser && currentUser.savedEvents) {
      setIsSaved(currentUser.savedEvents.includes(event._id));
    }
  }, [currentUser, event._id]);

  // Format date/time
  const eventDate = new Date(event.startTime);
  const formattedDateTime = formatDateTime(eventDate);

  // Sort tags from shortest to longest
  const sortedCategories = [...event.categories].sort((a, b) => a.length - b.length);

  // Use useLayoutEffect to measure tags after DOM updates but before paint
  useLayoutEffect(() => {
		if (!tagsContainerRef.current) return;
		const containerWidth = tagsContainerRef.current.offsetWidth;
		const dummy = document.createElement("span");
		dummy.style.visibility = "hidden";
		dummy.style.position = "absolute";
		dummy.style.whiteSpace = "nowrap";
		dummy.style.font = getComputedStyle(tagsContainerRef.current).font;
		document.body.appendChild(dummy);
	
		let totalWidth = 0;
		let count = 0;
		const gap = 6; // <-- Change this if your CSS gap is different
	
		// Loop over sorted tags
		for (let i = 0; i < sortedCategories.length; i++) {
			dummy.innerText = sortedCategories[i];
			// The extraWidth value (16) should equal the sum of horizontal paddings (and borders if any)
			const extraWidth = 5; // <-- Adjust this value to match your .tag-badge computed padding
			const tagWidth = dummy.offsetWidth + extraWidth;
			if (i > 0) totalWidth += gap;
			if (totalWidth + tagWidth > containerWidth) break;
			totalWidth += tagWidth;
			count++;
		}
		// Account for the "+x" badge
		if (count < sortedCategories.length) {
			dummy.innerText = `+${sortedCategories.length - count}`;
			const extraWidth = 16; // Same as above
			const plusWidth = dummy.offsetWidth + extraWidth;
			if (totalWidth + (count > 0 ? gap : 0) + plusWidth > containerWidth && count > 0) {
				count--;
			}
		}
		document.body.removeChild(dummy);
		setVisibleCount(count);
	}, [sortedCategories]);	

  // Build image URL
  const imageUrl = event.imageId
    ? `http://localhost:5000/events/image/${event.imageId}`
    : null;

  // Save toggle
  const handleSaveClick = () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    onToggleSave(event._id, newSavedState);
  };

  return (
    <div className="event-card">
      <div className="event-card-header">
        <h3 className="event-title">{event.title}</h3>
        <button className="save-btn" onClick={handleSaveClick}>
          {isSaved ? (
            <img src="/assets/explore/save_solid.svg" alt="Saved" />
          ) : (
            <img src="/assets/explore/save_outlined.svg" alt="Save" />
          )}
        </button>
      </div>
      <div className="event-card-body">
        <div className="event-image">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/placeholder-grey.png";
              }}
            />
          ) : (
            <div className="image-placeholder" />
          )}
        </div>
        <div className="event-info">
          <div className="event-datetime">
            <span>{formattedDateTime}</span>
          </div>
          <div className="event-tags" ref={tagsContainerRef}>
            {sortedCategories.slice(0, visibleCount).map((cat, idx) => (
              <span key={idx} className={`tag-badge ${getTagColorClass(cat)}`}>
                {cat}
              </span>
            ))}
            {sortedCategories.length > visibleCount && (
              <span className="tag-badge more-tags">
                +{sortedCategories.length - visibleCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Same helper functions below...
function formatDateTime(dateObj) {
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = dateObj.toLocaleDateString("en-US", { month: "long" });
  const day = dateObj.getDate();
  const ordinal = getOrdinal(day);
  const timeString = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dayName}, ${monthName} ${day}${ordinal} • ${timeString}`;
}

function getOrdinal(n) {
  if (n > 3 && n < 21) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function getTagColorClass(tag) {
  if (academicTags.includes(tag)) return "academic";
  if (socialTags.includes(tag)) return "social";
  if (careerTags.includes(tag)) return "career";
  return "";
}

export default EventCard;
