"use client";

import { useState } from "react";
import { Mail, Phone, Send, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function HomeContactForm({ copy }: { copy: Dictionary["home"] }) {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="rounded-base border-2 border-border bg-card p-5 shadow-shadow sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2" htmlFor="home-contact-name">
            <UserRound className="size-4 text-primary" />
            {copy.fullName}
          </Label>
          <Input id="home-contact-name" name="fullName" placeholder="Nguyen Van A" required />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2" htmlFor="home-contact-phone">
            <Phone className="size-4 text-primary" />
            {copy.contactPhone}
          </Label>
          <Input id="home-contact-phone" name="phone" placeholder="0901234567" required type="tel" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2" htmlFor="home-contact-email">
            <Mail className="size-4 text-primary" />
            {copy.email}
          </Label>
          <Input id="home-contact-email" name="email" placeholder="you@company.com" required type="email" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="home-contact-subject">{copy.contactSubject}</Label>
          <Input id="home-contact-subject" name="subject" placeholder={copy.contactSubjectPlaceholder} required />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="home-contact-message">{copy.contactMessage}</Label>
          <Textarea
            className="min-h-36"
            id="home-contact-message"
            name="message"
            placeholder={copy.contactMessagePlaceholder}
            required
          />
        </div>
      </div>
      {sent && (
        <p className="mt-5 rounded-base border-2 border-border bg-secondary p-3 text-sm font-black text-foreground">
          {copy.contactSuccess}
        </p>
      )}
      <Button className="mt-5 w-full md:w-auto md:px-10" size="lg" type="submit">
        <Send className="size-4" />
        {copy.contactSubmit}
      </Button>
    </form>
  );
}
