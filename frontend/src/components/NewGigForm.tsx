import { useState, type FormEvent } from "react";

type NewGigFormProps = {
  latitude: number;
  longitude: number;
  onSubmit: (payload: {
    title: string;
    description: string;
    category: string;
    payAmount: number;
    currency: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    startsAt: string;
    media: Array<{ type: "IMAGE" | "VIDEO" | "VOICE"; objectKey: string }>;
  }) => Promise<void>;
};

export function NewGigForm({ latitude, longitude, onSubmit }: NewGigFormProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [payAmount, setPayAmount] = useState(500);
  const [radiusMeters, setRadiusMeters] = useState(3000);
  const [startsAt, setStartsAt] = useState(new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (title.trim().length < 4) {
      setFeedback({ type: "error", text: "Title must be at least 4 characters." });
      return;
    }

    if (description.trim().length < 10) {
      setFeedback({ type: "error", text: "Description must be at least 10 characters." });
      return;
    }

    if (payAmount <= 0) {
      setFeedback({ type: "error", text: "Pay amount must be greater than zero." });
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        payAmount,
        currency: "KES",
        latitude,
        longitude,
        radiusMeters,
        startsAt: new Date(startsAt).toISOString(),
        media: []
      });
      setTitle("");
      setDescription("");
      setCategory("GENERAL");
      setPayAmount(500);
      setRadiusMeters(3000);
      setFeedback({ type: "success", text: "Gig posted successfully." });
    } catch (error) {
      const data =
        (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      setFeedback({
        type: "error",
        text: data?.error ?? data?.message ?? "Unable to post gig right now."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h3>Create Gig</h3>
      {feedback ? (
        <p className={feedback.type === "success" ? "info-text" : "error-text"}>{feedback.text}</p>
      ) : null}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Gig title" required minLength={4} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task" required minLength={20} rows={4} />
      <div className="row-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="GENERAL">General</option>
          <option value="DELIVERY">Delivery</option>
          <option value="TUTORING">Tutoring</option>
          <option value="PHOTOGRAPHY">Photography</option>
          <option value="LABOR">Labor</option>
          <option value="TECH">Tech</option>
        </select>
        <input type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} min={50} required />
      </div>
      <div className="row-2">
        <label>
          Radius (m)
          <input type="range" min={100} max={50000} step={100} value={radiusMeters} onChange={(e) => setRadiusMeters(Number(e.target.value))} />
        </label>
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
      </div>
      <button type="submit" disabled={loading}>{loading ? "Posting..." : "Post Gig"}</button>
    </form>
  );
}

