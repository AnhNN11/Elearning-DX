"use client";

import { useState } from "react";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function MarkdownEditor({
  emptyPreview = "_Nội dung preview sẽ hiển thị ở đây._",
  name,
  placeholder,
  defaultValue = "",
  required,
}: {
  emptyPreview?: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <Tabs defaultValue="write">
      <TabsList>
        <TabsTrigger value="write">Markdown</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <Textarea
          className="min-h-44 font-mono"
          name={name}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          required={required}
          value={value}
        />
      </TabsContent>
      <TabsContent value="preview">
        <div className="min-h-44 rounded-lg border bg-background p-4">
          <MarkdownViewer
            content={value || emptyPreview}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
