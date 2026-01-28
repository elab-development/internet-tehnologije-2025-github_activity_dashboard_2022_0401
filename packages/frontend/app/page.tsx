"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { InputField } from "@/src/components/ui/InputField";
import { Card } from "@/src/components/ui/Card";

export default function Home() {
  const [text, setText] = useState("");

  return (
    <main className="min-h-screen p-10">
      <Card>
        <h1 className="text-2xl font-semibold mb-4">
          GitHub Activity Dashboard
        </h1>

        <InputField
          label="Test input"
          value={text}
          onChange={setText}
          placeholder="upiši nešto"
        />

        <div className="mt-4 flex gap-2">
          <Button onClick={() => alert(text || "Hello!")}>
            Primary
          </Button>
          <Button variant="secondary" onClick={() => setText("")}>
            Secondary
          </Button>
        </div>
      </Card>
    </main>
  );
}
