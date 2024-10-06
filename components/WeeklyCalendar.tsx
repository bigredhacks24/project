import React, { useEffect, useRef } from "react";
import { getColorFromString } from "@/utils/utils";

interface AvailabilityBlock {
  start: Date;
  end: Date;
}

interface WeeklyCalendarProps {
  startDate: Date;
  commonAvailability: { [key: string]: AvailabilityBlock[] }; // Expecting an object with days as keys
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  startDate,
  commonAvailability,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dayWidth = width / 7.55;
    const hoursDisplayed = 15; // 9 AM to 12 AM (midnight)
    const hourHeight = (height - 60) / hoursDisplayed; // Subtract 60px for top padding
    const leftPadding = 60; // Left padding for hour labels

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw "GMT-4" label
    ctx.fillStyle = "#9C9C9C";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText("GMT-4", 12, 52);

    // Draw grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;

    // Vertical lines for days
    for (let i = 0; i <= 7; i++) {
      ctx.beginPath();
      ctx.moveTo(leftPadding + i * dayWidth, 50); // Extended 10px up
      ctx.lineTo(leftPadding + i * dayWidth, height);
      ctx.stroke();
    }

    // Horizontal lines for hours
    for (let i = 0; i <= hoursDisplayed; i++) {
      ctx.beginPath();
      ctx.moveTo(leftPadding - 10, 60 + i * hourHeight); // Extended 10px left
      ctx.lineTo(width, 60 + i * hourHeight);
      ctx.stroke();
    }

    // Draw day labels
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    ctx.fillStyle = "#9C9C9C"; // Lighter gray color
    ctx.textAlign = "center";
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Day of week
      ctx.font = "12px Arial";
      ctx.fillText(
        days[currentDate.getDay()],
        leftPadding + i * dayWidth + dayWidth / 2,
        20
      );

      // Date number
      ctx.font = "bold 20px Arial";
      ctx.fillText(
        currentDate.getDate().toString(),
        leftPadding + i * dayWidth + dayWidth / 2,
        45
      );
    }

    // Draw hour labels
    ctx.textAlign = "right";
    ctx.font = "12px Arial";
    for (let i = 9; i <= 24; i++) {
      const hour = i % 12 || 12;
      const ampm = i < 12 ? "AM" : "PM";
      ctx.fillText(
        `${hour}${ampm}`,
        leftPadding - 15,
        75 + (i - 9) * hourHeight
      );
    }

    // Draw availability blocks
    ctx.fillStyle = "rgb(152,163,246)";
    Object.entries(commonAvailability).forEach(([day, blocks]) => {
      blocks.forEach((block) => {
        const daysDiff = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].indexOf(day);
        if (daysDiff >= 0 && daysDiff < 7) {
          const startHour = new Date(block.start).getHours();
          const endHour = new Date(block.end).getHours();
          const startY = 60 + (startHour - 9) * hourHeight;
          const endY = 60 + (endHour - 9) * hourHeight;
          ctx.fillRect(
            leftPadding + daysDiff * dayWidth,
            startY,
            dayWidth,
            endY - startY
          );
        }
      });
    });
  }, [startDate, commonAvailability]);

  return (
    <canvas
      ref={canvasRef}
      width={860}
      height={1000}
      className="w-full h-auto"
    />
  );
};

export default WeeklyCalendar;
