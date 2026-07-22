"use client";

import { useState, useEffect } from "react";

export function useStudentFeatures() {
  const [features, setFeatures] = useState<Set<string> | null>(null);

  useEffect(() => {
    fetch("/api/student/features")
      .then(r => r.json())
      .then(d => {
        if (d.success) setFeatures(new Set<string>(d.data));
      })
      .catch(() => setFeatures(new Set()));
  }, []);

  return features;
}
