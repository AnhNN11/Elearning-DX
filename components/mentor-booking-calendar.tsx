"use client";

import { CalendarDays, CheckCircle2, Clock3, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { bookMentorAction } from "@/lib/actions";
import type { Mentor } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const timeSlots = ["09:00", "10:30", "14:00", "16:00", "20:00"];

function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function toDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function MentorBookingCalendar({
  bookingCopy,
  formCopy,
  locale,
  mentors,
  success,
}: {
  bookingCopy: Dictionary["booking"];
  formCopy: Dictionary["home"];
  locale: string;
  mentors: Mentor[];
  success?: boolean;
}) {
  const [selectedMentor, setSelectedMentor] = useState(mentors[0]?.name ?? "");
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
  }, []);
  const [selectedDate, setSelectedDate] = useState(toDateValue(dates[1] ?? new Date()));
  const [selectedTime, setSelectedTime] = useState(timeSlots[3]);
  const selectedMentorInfo = mentors.find((mentor) => mentor.name === selectedMentor) ?? mentors[0];
  const preferredTime = `${selectedDate} ${selectedTime} · ${selectedMentor}`;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        {success && (
          <Card className="border-main bg-secondary">
            <CardContent className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm font-black text-foreground">{bookingCopy.success}</p>
            </CardContent>
          </Card>
        )}

        <Card className="dx-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase">
              <UserRound className="size-5" />
              {bookingCopy.mentorTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {mentors.map((mentor) => (
              <button
                className={`rounded-base border-2 p-4 text-left transition ${
                  selectedMentor === mentor.name
                    ? "border-primary bg-secondary shadow-shadow"
                    : "border-border bg-background hover:-translate-y-0.5 hover:shadow-shadow"
                }`}
                key={mentor.name}
                onClick={() => setSelectedMentor(mentor.name)}
                type="button"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-foreground">{mentor.name}</p>
                    <p className="mt-1 text-sm font-bold text-muted-foreground">{mentor.role}</p>
                  </div>
                  <Badge variant="outline">{mentor.schedule}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {mentor.expertise.map((item) => (
                    <Badge key={item} variant="secondary">{item}</Badge>
                  ))}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="dx-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase">
              <CalendarDays className="size-5" />
              {bookingCopy.calendarTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {dates.map((date) => {
                const value = toDateValue(date);
                return (
                  <button
                    className={`rounded-base border-2 px-3 py-4 text-center text-sm font-black transition ${
                      selectedDate === value
                        ? "border-primary bg-main text-main-foreground shadow-shadow"
                        : "border-border bg-background hover:-translate-y-0.5 hover:shadow-shadow"
                    }`}
                    key={value}
                    onClick={() => setSelectedDate(value)}
                    type="button"
                  >
                    {formatDate(date, locale === "vi" ? "vi-VN" : "en-US")}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-wide text-muted-foreground">
              {bookingCopy.timezone}
            </p>
          </CardContent>
        </Card>

        <Card className="dx-card bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase">
              <Clock3 className="size-5" />
              {bookingCopy.timeTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {timeSlots.map((slot) => (
              <Button
                key={slot}
                onClick={() => setSelectedTime(slot)}
                type="button"
                variant={selectedTime === slot ? "default" : "outline"}
              >
                {slot}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-beam-card h-fit lg:sticky lg:top-24">
        <CardHeader>
          <Badge className="w-fit">{formCopy.bookingBadge}</Badge>
          <CardTitle className="text-3xl font-black uppercase">{bookingCopy.formTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-5 rounded-base border-2 border-border bg-secondary p-4">
            <p className="text-sm font-black uppercase text-primary">{bookingCopy.detailTitle}</p>
            <div className="mt-3 grid gap-2 text-sm">
              <p><span className="text-muted-foreground">{bookingCopy.selectedMentor}:</span> {selectedMentorInfo?.name}</p>
              <p><span className="text-muted-foreground">{bookingCopy.selectedDate}:</span> {selectedDate}</p>
              <p><span className="text-muted-foreground">{bookingCopy.selectedTime}:</span> {selectedTime}</p>
            </div>
          </div>

          <form action={bookMentorAction} className="space-y-4">
            <input name="preferredTime" type="hidden" value={preferredTime} />
            <input name="mentorName" type="hidden" value={selectedMentor} />
            <input name="interviewRole" type="hidden" value={formCopy.topicPlaceholder} />
            <input name="skills" type="hidden" value={selectedMentorInfo?.expertise.join(", ") ?? ""} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{formCopy.fullName}</Label>
                <Input name="fullName" placeholder="Nguyễn Văn A" required />
              </div>
              <div className="space-y-2">
                <Label>{formCopy.email}</Label>
                <Input name="email" placeholder="you@email.com" required type="email" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{formCopy.topic}</Label>
                <Input name="topic" placeholder={formCopy.topicPlaceholder} required />
              </div>
              <div className="space-y-2">
                <Label>{formCopy.level}</Label>
                <Input name="level" placeholder={formCopy.levelPlaceholder} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{formCopy.note}</Label>
              <Textarea name="note" placeholder={formCopy.notePlaceholder} />
            </div>
            <Button className="w-full" size="lg" type="submit">
              <CalendarDays className="size-4" />
              {formCopy.submitBooking}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
