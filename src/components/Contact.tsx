import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Building2, Loader2, Mail, MapPin, Send } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { InstagramIcon } from "./BrandIcons";
import { db } from "../lib/firebase";

type Status = "idle" | "loading" | "success" | "error";

const CONTACT_FORM_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxQAXAemEX7-3DD6qWEvVLA-qxCAJ7yHcbbLoU_MxDIZfXU0QhTP3xRnlssSFXEhPxt/exec";

interface Errors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  const validate = (form: HTMLFormElement): Errors => {
    const data = new FormData(form);
    const next: Errors = {};
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name) next.name = "Please share your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!subject) next.subject = "Add a short subject.";
    if (!message || message.length < 10) next.message = "Message should be at least 10 characters.";
    return next;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setStatus("loading");
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "").trim();
    const message = String(data.get("message") || "").trim();

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await setDoc(doc(db, "messages", messageId), {
        id: messageId,
        name,
        email,
        subject,
        message,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Firestore message save notice:", err);
      // Non-blocking for user experience if offline
    }

    try {
      HTMLFormElement.prototype.submit.call(form);
    } catch (err) {
      console.warn("Form target submit notice:", err);
    }

    setStatus("success");
    form.reset();
  };

  return (
    <section id="contact" className="relative bg-[#0B1320]/40 backdrop-blur-sm py-28 text-cream border-t border-gold/15">
      <div className="container-edit grid gap-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">
            Let's build something together
          </h2>
          <p className="mt-6 max-w-sm text-beige/75">
            Questions about joining, collaborating on a project, or partnering
            on an event — send a note and the team will get back to you.
          </p>
          <div className="mt-10 space-y-7">
            <ContactDetail icon={<Mail size={22} />} label="Email">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=techvedas.dsu@gmail.com"
                target="_blank"
                rel="noreferrer"
                className="text-lg text-beige/90 transition-colors hover:text-gold"
              >
                techvedas.dsu@gmail.com
              </a>
            </ContactDetail>

            <ContactDetail icon={<MapPin size={22} />} label="Address">
              <p className="max-w-sm text-lg leading-relaxed text-beige/90">
                Dayananda Sagar University,<br />
                Devarakaggalahalli, Harohalli,<br />
                Kanakapura Road,<br />
                Bengaluru – 562112
              </p>
            </ContactDetail>

            <ContactDetail icon={<Building2 size={22} />} label="Department">
              <p className="text-lg text-beige/90">Dept. of CSE (Artificial Intelligence &amp; Data Science)</p>
            </ContactDetail>

            <div className="pt-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">Follow us</p>
              <a href="https://www.instagram.com/techvedas_dsu?utm_source=qr&stkn=MTA0a3pxNzQ4dWVzMA==" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-lg text-beige/90 transition-colors hover:text-gold">
                <span aria-hidden>→</span>
                <InstagramIcon size={18} />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          action={CONTACT_FORM_ENDPOINT}
          method="post"
          target="contact-form-submission"
          noValidate
          className="space-y-5"
        >
          <Field label="Name" name="name" error={errors.name} />
          <Field label="Email" name="email" type="email" error={errors.email} />
          <Field label="Subject" name="subject" error={errors.subject} />
          <Field label="Message" name="message" textarea error={errors.message} />

          <motion.button
            type="submit"
            disabled={status === "loading"}
            whileHover={{ y: -2 }}
            className="flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 text-sm font-semibold text-cream disabled:opacity-70"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send message <Send size={15} />
              </>
            )}
          </motion.button>

          {status === "success" && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-sage"
            >
              Thanks! Your message has been sent.
            </motion.p>
          )}
          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-terracotta"
            >
              Something went wrong — please try again.
            </motion.p>
          )}
        </form>
        <iframe
          name="contact-form-submission"
          title="Contact form submission"
          className="hidden"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

function ContactDetail({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brown/80 text-terracotta">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">{label}</p>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  textarea,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-beige/70">
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          className={`w-full rounded-lg border bg-transparent px-4 py-3 text-cream placeholder:text-beige/40 outline-none transition-colors duration-300 focus:border-gold ${
            error ? "border-terracotta" : "border-beige/25"
          }`}
        />
      ) : (
        <input
          type={type}
          name={name}
          className={`w-full rounded-lg border bg-transparent px-4 py-3 text-cream placeholder:text-beige/40 outline-none transition-colors duration-300 focus:border-gold ${
            error ? "border-terracotta" : "border-beige/25"
          }`}
        />
      )}
      {error && (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-1 block text-xs text-terracotta"
        >
          {error}
        </motion.span>
      )}
    </label>
  );
}
