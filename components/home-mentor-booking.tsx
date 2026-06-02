"use client";

import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

type Topic = {
  id: string;
  label: string;
  note: string;
};

type LevelOption = {
  id: string;
  label: string;
};

type CalendarEvent = {
  date: string;
  dayIndex: number;
  durationHours: number;
  id: string;
  note: string;
  startHour: number;
  time: string;
  title: string;
};

type WeekDay = {
  date: Date;
  label: string;
  month: string;
  number: string;
  value: string;
};

const calendarStartHour = 7;
const calendarEndHour = 21;
const calendarGridColumns = "6rem repeat(7, minmax(10rem, 1fr))";
const calendarRowHeight = "6.25rem";
const calendarHours = Array.from(
  { length: calendarEndHour - calendarStartHour },
  (_, index) => calendarStartHour + index,
);

const calendarScheduleTemplates = [
  {
    dayIndex: 0,
    durationHours: 1,
    levelIds: ["beginner", "junior", "middle"],
    startHour: 9,
    topicIds: ["project-review", "cv-portfolio"],
  },
  {
    dayIndex: 1,
    durationHours: 1,
    levelIds: ["beginner", "junior"],
    startHour: 12,
    topicIds: ["roadmap", "debug-plan"],
  },
  {
    dayIndex: 2,
    durationHours: 1,
    levelIds: ["beginner", "junior", "middle", "senior"],
    startHour: 15,
    topicIds: ["mock-interview", "project-review"],
  },
  {
    dayIndex: 3,
    durationHours: 1,
    levelIds: ["middle", "senior"],
    startHour: 18,
    topicIds: ["mock-interview", "cv-portfolio"],
  },
  {
    dayIndex: 4,
    durationHours: 1,
    levelIds: ["beginner", "junior", "middle", "senior"],
    startHour: 10,
    topicIds: ["project-review", "roadmap"],
  },
  {
    dayIndex: 6,
    durationHours: 1,
    levelIds: ["beginner", "junior", "middle"],
    startHour: 20,
    topicIds: ["debug-plan", "cv-portfolio"],
  },
];

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTomorrow() {
  const today = new Date();
  const date = new Date(today);
  date.setDate(today.getDate() + 1);

  return date;
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, (month || 1) - 1, day || 1);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);

  return next;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);

  return next;
}

function sameDate(first: Date, second: Date) {
  return toDateValue(first) === toDateValue(second);
}

function getMonthCells(monthCursor: Date) {
  const firstDay = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const gridStart = startOfWeek(firstDay);

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function getWeekdayLabels(locale: Locale) {
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const monday = new Date(2024, 0, 1);

  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(dateLocale, {
      weekday: "short",
    }).format(addDays(monday, index)),
  );
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatDateLabel(value: string, locale: Locale) {
  const date = parseDateValue(value);

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

function formatWeekRange(days: WeekDay[], locale: Locale) {
  const first = days[0]?.date;
  const last = days[days.length - 1]?.date;

  if (!first || !last) {
    return "";
  }

  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const format = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "long",
  });

  return `${format.format(first)} - ${format.format(last)}`;
}

function formatMonthLabel(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getTopics(locale: Locale): Topic[] {
  const labels =
    locale === "vi"
      ? [
          ["project-review", "Review dự án", "Portfolio, code quality, cách trình bày sản phẩm"],
          ["mock-interview", "Mock interview", "Luyện phỏng vấn frontend, backend hoặc system design"],
          ["roadmap", "Roadmap học tập", "Chọn lộ trình theo mục tiêu và trình độ hiện tại"],
          ["cv-portfolio", "CV / Portfolio", "Sửa CV, GitHub, LinkedIn và câu chuyện ứng tuyển"],
          ["debug-plan", "Gỡ vướng học tập", "Đang kẹt ở bài học, project hoặc định hướng"],
        ]
      : [
          ["project-review", "Project review", "Portfolio, code quality, and product presentation"],
          ["mock-interview", "Mock interview", "Practice frontend, backend, or system design interviews"],
          ["roadmap", "Learning roadmap", "Pick a path based on goals and current level"],
          ["cv-portfolio", "CV / Portfolio", "Improve CV, GitHub, LinkedIn, and application story"],
          ["debug-plan", "Learning blockers", "Unblock lessons, projects, or direction"],
        ];

  return labels.map(([id, label, note]) => ({ id, label, note }));
}

function getLevelOptions(locale: Locale): LevelOption[] {
  const labels =
    locale === "vi"
      ? [
          ["beginner", "Mới bắt đầu"],
          ["junior", "Junior"],
          ["middle", "Middle"],
          ["senior", "Senior"],
        ]
      : [
          ["beginner", "Beginner"],
          ["junior", "Junior"],
          ["middle", "Middle"],
          ["senior", "Senior"],
        ];

  return labels.map(([id, label]) => ({ id, label }));
}

function getWeekDays(dateValue: string, locale: Locale): WeekDay[] {
  const start = startOfWeek(parseDateValue(dateValue));

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

    return {
      date,
      label: new Intl.DateTimeFormat(dateLocale, {
        weekday: "short",
      }).format(date),
      month: new Intl.DateTimeFormat(dateLocale, {
        month: "short",
      }).format(date),
      number: new Intl.DateTimeFormat(dateLocale, {
        day: "2-digit",
      }).format(date),
      value: toDateValue(date),
    };
  });
}

function getCalendarEvents({
  levelId,
  locale,
  topic,
  topicId,
  weekDays,
}: {
  levelId: string;
  locale: Locale;
  topic?: Topic;
  topicId: string;
  weekDays: WeekDay[];
}): CalendarEvent[] {
  return calendarScheduleTemplates
    .filter((template) => template.topicIds.includes(topicId) && template.levelIds.includes(levelId))
    .slice(0, 3)
    .map((template) => {
      const day = weekDays[template.dayIndex];
      const startHour = Math.min(template.startHour, calendarEndHour - 1);
      const endHour = Math.min(startHour + template.durationHours, calendarEndHour);

      return {
        date: day.value,
        dayIndex: template.dayIndex,
        durationHours: endHour - startHour,
        id: `${day.value}-${topicId}-${levelId}-${startHour}`,
        note: locale === "vi" ? "Còn trống" : "Available",
        startHour,
        time: `${formatHour(startHour)} - ${formatHour(endHour)}`,
        title: topic?.label ?? (locale === "vi" ? "Mentor phù hợp" : "Matched mentor"),
      };
    });
}

function DatePickerPopover({
  locale,
  monthCursor,
  onMonthChange,
  onSelectDate,
  preferredDate,
}: {
  locale: Locale;
  monthCursor: Date;
  onMonthChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  preferredDate: string;
}) {
  const monthCells = getMonthCells(monthCursor);
  const selectedDate = parseDateValue(preferredDate);
  const weekdayLabels = getWeekdayLabels(locale);

  return (
    <div className="absolute left-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-base border-2 border-border bg-background p-4 shadow-shadow sm:left-auto sm:right-0">
      <div className="mb-3 flex items-center gap-3 border-b-2 border-border pb-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-base border-2 border-border bg-secondary">
          <CalendarDays className="size-4 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-heading text-foreground">
            {locale === "vi" ? "Chọn ngày" : "Pick a day"}
          </p>
          <p className="text-xs font-bold text-muted-foreground">{formatMonthLabel(monthCursor, locale)}</p>
        </div>
        <Button
          aria-label={locale === "vi" ? "Tháng trước" : "Previous month"}
          className="size-8 p-0"
          onClick={() => onMonthChange(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          aria-label={locale === "vi" ? "Tháng sau" : "Next month"}
          className="size-8 p-0"
          onClick={() => onMonthChange(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-heading uppercase text-muted-foreground">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {monthCells.map((date) => {
          const isSelected = sameDate(date, selectedDate);
          const isOutsideMonth = date.getMonth() !== monthCursor.getMonth();

          return (
            <button
              className={cn(
                "grid aspect-square place-items-center rounded-base border-2 text-sm font-heading transition",
                isSelected
                  ? "border-border bg-main text-main-foreground shadow-[2px_2px_0_0_var(--foreground)]"
                  : "border-transparent text-foreground hover:border-border hover:bg-secondary",
                isOutsideMonth && !isSelected && "text-muted-foreground/35",
              )}
              key={toDateValue(date)}
              onClick={() => onSelectDate(date)}
              type="button"
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function HomeMentorBooking({
  copy,
  locale,
}: {
  copy: Dictionary["home"];
  locale: Locale;
}) {
  const topics = useMemo(() => getTopics(locale), [locale]);
  const levels = useMemo(() => getLevelOptions(locale), [locale]);
  const defaultDate = useMemo(() => toDateValue(getTomorrow()), []);
  const [datePickerAnchor, setDatePickerAnchor] = useState<"form" | "calendar" | null>(null);
  const [monthCursor, setMonthCursor] = useState(() => parseDateValue(defaultDate));
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id ?? "");
  const [selectedLevelId, setSelectedLevelId] = useState(levels[0]?.id ?? "");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [preferredDate, setPreferredDate] = useState(defaultDate);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? topics[0];
  const selectedLevel = levels.find((level) => level.id === selectedLevelId) ?? levels[0];
  const weekDays = useMemo(() => getWeekDays(preferredDate, locale), [locale, preferredDate]);
  const calendarEvents = useMemo(
    () =>
      getCalendarEvents({
        levelId: selectedLevelId,
        locale,
        topic: selectedTopic,
        topicId: selectedTopicId,
        weekDays,
      }),
    [locale, selectedLevelId, selectedTopic, selectedTopicId, weekDays],
  );
  const selectedSlot = calendarEvents.find((slot) => slot.id === selectedSlotId);

  function toggleDatePicker(anchor: "form" | "calendar") {
    setMonthCursor(parseDateValue(preferredDate));
    setDatePickerAnchor((current) => (current === anchor ? null : anchor));
  }

  function updatePreferredDate(value: string) {
    setPreferredDate(value);
    setSelectedSlotId("");
    setMonthCursor(parseDateValue(value));
  }

  function moveWeek(days: number) {
    updatePreferredDate(toDateValue(addDays(parseDateValue(preferredDate), days)));
  }

  function selectDate(date: Date) {
    updatePreferredDate(toDateValue(date));
    setDatePickerAnchor(null);
  }

  function selectSlot(slot: CalendarEvent) {
    setPreferredDate(slot.date);
    setSelectedSlotId(slot.id);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6">
      <section>
        <div className="max-w-4xl">
          <p className="text-sm font-heading uppercase tracking-wide text-primary">{copy.mentorEyebrow}</p>
          <h2 className="mt-2 text-4xl font-heading tracking-tight text-foreground sm:text-5xl">
            {copy.mentorTitle}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            {copy.mentorDescription}
          </p>
        </div>

        <form className="mt-8 rounded-base border-2 border-border bg-card p-5 shadow-shadow sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-border pb-5">
            <div>
              <p className="text-xs font-heading uppercase tracking-wide text-primary">{copy.bookingBadge}</p>
              <h3 className="mt-1 text-3xl font-heading text-foreground">{copy.bookingTitle}</h3>
            </div>
            {selectedSlot && (
              <span className="rounded-base border-2 border-border bg-secondary px-3 py-2 text-sm font-heading text-foreground">
                {formatDateLabel(preferredDate, locale)} · {selectedSlot.time}
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="home-booking-name">{copy.fullName}</Label>
              <Input id="home-booking-name" name="fullName" placeholder="Nguyen Van A" />
            </div>
            <div className="space-y-2">
              <Label>{copy.preferredTime}</Label>
              <div className="relative">
                <input name="preferredDate" type="hidden" value={preferredDate} />
                <button
                  className="flex h-10 w-full items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-left text-sm font-base text-foreground outline-none ring-offset-background transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => toggleDatePicker("form")}
                  type="button"
                >
                  <span className="truncate">{formatDateLabel(preferredDate, locale)}</span>
                  <CalendarDays className="size-4 shrink-0 text-primary" />
                </button>
                {datePickerAnchor === "form" && (
                  <DatePickerPopover
                    locale={locale}
                    monthCursor={monthCursor}
                    onMonthChange={setMonthCursor}
                    onSelectDate={selectDate}
                    preferredDate={preferredDate}
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="home-booking-topic">{copy.topic}</Label>
              <Select
                name="topic"
                onValueChange={(value) => {
                  setSelectedTopicId(value);
                  setSelectedSlotId("");
                }}
                value={selectedTopicId}
              >
                <SelectTrigger className="h-10" id="home-booking-topic">
                  <SelectValue placeholder={copy.topicPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="home-booking-level">{copy.level}</Label>
              <Select
                name="level"
                onValueChange={(value) => {
                  setSelectedLevelId(value);
                  setSelectedSlotId("");
                }}
                value={selectedLevelId}
              >
                <SelectTrigger className="h-10" id="home-booking-level">
                  <SelectValue placeholder={copy.levelPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 rounded-base border-2 border-border bg-secondary p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm leading-6 text-muted-foreground">
                {selectedSlot
                  ? `${selectedTopic?.label ?? copy.topic} · ${selectedLevel?.label ?? copy.level} · ${formatDateLabel(preferredDate, locale)} · ${selectedSlot.time}`
                  : copy.preferredTime}
              </p>
            </div>
          </div>

          <Button className="mt-5 w-full md:w-auto md:px-10" size="lg" type="button">
            <CalendarCheck className="size-4" />
            {copy.submitBooking}
          </Button>
        </form>
      </section>

      <section className="rounded-base border-2 border-border bg-secondary p-4 shadow-shadow sm:p-6">
        <div className="relative flex flex-wrap items-start justify-between gap-4 rounded-base border-2 border-border bg-background px-4 py-4">
          <div>
            <p className="text-xs font-heading uppercase tracking-wide text-primary">
              {locale === "vi" ? "Lịch mentor phù hợp" : "Matched mentor calendar"}
            </p>
            <h3 className="mt-1 text-3xl font-heading text-foreground">
              {formatWeekRange(weekDays, locale)}
            </h3>
            <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">
              {formatHour(calendarStartHour)} - {formatHour(calendarEndHour)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              aria-label={locale === "vi" ? "Tuần trước" : "Previous week"}
              className="size-10 p-0"
              onClick={() => moveWeek(-7)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="relative">
              <Button
                aria-label={locale === "vi" ? "Chọn ngày" : "Choose date"}
                className="size-10 p-0"
                onClick={() => toggleDatePicker("calendar")}
                size="icon"
                type="button"
                variant="outline"
              >
                <CalendarDays className="size-5 text-primary" />
              </Button>
              {datePickerAnchor === "calendar" && (
                <DatePickerPopover
                  locale={locale}
                  monthCursor={monthCursor}
                  onMonthChange={setMonthCursor}
                  onSelectDate={selectDate}
                  preferredDate={preferredDate}
                />
              )}
            </div>
            <Button
              aria-label={locale === "vi" ? "Tuần sau" : "Next week"}
              className="size-10 p-0"
              onClick={() => moveWeek(7)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-base border-2 border-border bg-background">
          <div className="overflow-x-auto overflow-y-hidden">
            <div className="min-w-[78rem]">
              <div
                className="grid border-b-2 border-border bg-secondary"
                style={{ gridTemplateColumns: calendarGridColumns }}
              >
                <div className="border-r-2 border-border px-4 py-4 text-xs font-heading uppercase text-muted-foreground">
                  GMT+7
                </div>
                {weekDays.map((day) => {
                  const isSelectedDay = day.value === preferredDate;
                  const dayEventCount = calendarEvents.filter((event) => event.date === day.value).length;

                  return (
                    <button
                      className={cn(
                        "border-r-2 border-border px-4 py-4 text-center transition last:border-r-0",
                        isSelectedDay ? "bg-background text-primary" : "text-foreground hover:bg-background/70",
                      )}
                      key={day.value}
                      onClick={() => updatePreferredDate(day.value)}
                      type="button"
                    >
                      <span className="block text-xs font-heading uppercase text-muted-foreground">{day.label}</span>
                      <span className="mt-1 block text-3xl font-heading leading-none">{day.number}</span>
                      <span className="mt-1 block text-[11px] font-bold uppercase text-muted-foreground">{day.month}</span>
                      {dayEventCount > 0 && (
                        <span className="mt-2 inline-flex rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-heading text-foreground">
                          {dayEventCount} {locale === "vi" ? "khung" : "slots"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div
                className="grid overflow-visible"
                style={{
                  gridTemplateColumns: calendarGridColumns,
                  gridTemplateRows: `repeat(${calendarHours.length}, ${calendarRowHeight})`,
                }}
              >
                {calendarHours.map((hour, rowIndex) => (
                  <div
                    className="border-r-2 border-b border-border/70 bg-background px-4 py-3 font-mono text-sm font-black text-muted-foreground"
                    key={hour}
                    style={{ gridColumn: 1, gridRow: rowIndex + 1 }}
                  >
                    {formatHour(hour)}
                  </div>
                ))}
                {weekDays.flatMap((day, dayIndex) =>
                  calendarHours.map((hour, rowIndex) => (
                    <button
                      aria-label={`${formatDateLabel(day.value, locale)} ${formatHour(hour)}`}
                      className={cn(
                        "border-r-2 border-b border-border/70 bg-background transition hover:bg-secondary/60",
                        day.value === preferredDate && "bg-muted/45",
                      )}
                      key={`${day.value}-${hour}`}
                      onClick={() => updatePreferredDate(day.value)}
                      style={{ gridColumn: dayIndex + 2, gridRow: rowIndex + 1 }}
                      type="button"
                    />
                  )),
                )}
                {calendarEvents.map((event) => {
                  const isSelected = selectedSlot?.id === event.id;

                  return (
                    <button
                      className={cn(
                        "relative z-10 m-2 flex h-[calc(100%-1rem)] min-w-0 flex-col justify-center overflow-hidden rounded-base border-2 border-border bg-main px-3 pb-7 pt-2 text-left text-main-foreground transition hover:-translate-y-0.5",
                        isSelected && "shadow-[3px_3px_0_0_var(--foreground)] ring-2 ring-background",
                      )}
                      key={event.id}
                      onClick={() => selectSlot(event)}
                      style={{
                        gridColumn: event.dayIndex + 2,
                        gridRow: `${event.startHour - calendarStartHour + 1} / span ${event.durationHours}`,
                      }}
                      type="button"
                    >
                      <span className="block truncate text-base font-heading leading-tight">{event.time}</span>
                      <span className="mt-1 block truncate text-xs font-black uppercase leading-tight">
                        {event.title}
                      </span>
                      <span className="absolute bottom-2 left-3 inline-flex w-fit rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-heading leading-none text-foreground">
                        {event.note}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
