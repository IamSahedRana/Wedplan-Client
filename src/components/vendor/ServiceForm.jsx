"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { ImageUploader } from "@/components/shared/ImageUploader";
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
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/constants";

export const serviceSchema = z
  .object({
    serviceName: z.string().min(3, "Service name must be at least 3 characters").max(100),
    category: z.enum(CATEGORIES, { message: "Choose a category" }),
    description: z.string().min(10, "Description must be at least 10 characters").max(2000),
    price: z.number().positive("Price must be greater than 0").max(10_000_000),
    location: z.string().min(2, "Location is required").max(120),
    images: z.array(z.url()).min(1, "Add at least one image").max(6, "Maximum 6 images"),
  })
  .strict();

const EMPTY = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  location: "",
  images: [],
};

/** Shared create/edit form — calls onSubmit with validated API-shaped values. */
export function ServiceForm({ initial, onSubmit, submitLabel = "Publish Service", submitting = false }) {
  const [values, setValues] = useState({
    ...EMPTY,
    ...(initial || {}),
    price: initial?.price != null ? String(initial.price) : "",
    images: initial?.images || [],
  });
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const parsed = serviceSchema.safeParse({ ...values, price: Number(values.price) });
    if (!parsed.success) {
      const next = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] && !next[issue.path[0]]) next[issue.path[0]] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="serviceName">Service name</Label>
        <Input
          id="serviceName"
          placeholder="e.g. Golden Hour Wedding Photography"
          value={values.serviceName}
          onChange={(e) => set("serviceName", e.target.value)}
        />
        {errors.serviceName && <p className="text-xs text-error">{errors.serviceName}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Select value={values.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-error">{errors.category}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 500"
            value={values.price}
            onChange={(e) => set("price", e.target.value)}
          />
          {errors.price && <p className="text-xs text-error">{errors.price}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g. Dhaka, Bangladesh"
          value={values.location}
          onChange={(e) => set("location", e.target.value)}
        />
        {errors.location && <p className="text-xs text-error">{errors.location}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={5}
          placeholder="Describe what your service includes, your experience and what couples can expect…"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
        <div className="flex justify-between text-xs">
          <span className="text-error">{errors.description}</span>
          <span className="text-muted-foreground">{values.description.length}/2000</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Photos (up to 6)</Label>
        <ImageUploader
          multiple
          value={values.images}
          onChange={(urls) => set("images", urls)}
        />
        {errors.images && <p className="text-xs text-error">{errors.images}</p>}
      </div>

      <Button type="submit" disabled={submitting} className="w-full rounded-full sm:w-auto">
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
