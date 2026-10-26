import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import {
  Calendar,
  Clock,
  Database,
  ExternalLink,
  Mail,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { db } from "../lib/firebase";
import type { LoginRecord, UserProfile } from "../context/AuthContext";

interface EventRegistrationRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  eventId: string;
  eventTitle: string;
  registeredAt: string;
}

interface MessageRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface AdminModalProps {
  onClose: () => void;
}

const FIRESTORE_CONSOLE_URL =
  "https://console.firebase.google.com/project/gen-lang-client-0852922618/firestore/databases/ai-studio-techvedas-842b0c9a-a039-4d36-99fd-48594f58bcec/data";

const AUTH_CONSOLE_URL =
  "https://console.firebase.google.com/project/gen-lang-client-0852922618/authentication/users";

export default function AdminModal({ onClose }: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<"logins" | "users" | "registrations" | "messages" | "firebase">("logins");
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistrationRecord[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time logins
  useEffect(() => {
    try {
      const q = query(collection(db, "logins"), orderBy("loggedInAt", "desc"), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: LoginRecord[] = [];
        snapshot.forEach((docSnap) => list.push(docSnap.data() as LoginRecord));
        setLogins(list);
        setLoading(false);
      }, (err) => {
        console.warn("Logins fetch error:", err);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  // Subscribe to user profiles
  useEffect(() => {
    try {
      const q = query(collection(db, "users"), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => list.push(docSnap.data() as UserProfile));
        setUsers(list);
      }, (err) => console.warn("Users fetch error:", err));
      return () => unsubscribe();
    } catch {
      // Ignored
    }
  }, []);

  // Subscribe to registrations
  useEffect(() => {
    try {
      const q = query(collection(db, "registrations"), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: EventRegistrationRecord[] = [];
        snapshot.forEach((docSnap) => list.push(docSnap.data() as EventRegistrationRecord));
        setRegistrations(list);
      }, (err) => console.warn("Registrations fetch error:", err));
      return () => unsubscribe();
    } catch {
      // Ignored
    }
  }, []);

  // Subscribe to contact messages
  useEffect(() => {
    try {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: MessageRecord[] = [];
        snapshot.forEach((docSnap) => list.push(docSnap.data() as MessageRecord));
        setMessages(list);
      }, (err) => console.warn("Messages fetch error:", err));
      return () => unsubscribe();
    } catch {
      // Ignored
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-espresso/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gold/30 bg-[#0B1320] text-cream shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-gold border border-gold/40">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-cream">Admin Control Panel</h2>
              <p className="text-xs text-beige/60">Live Firestore Data &amp; Firebase Console Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-beige/60 transition-colors hover:bg-terracotta/20 hover:text-cream"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-beige/10 px-6 pt-2 gap-2 bg-brown/20 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("logins")}
            className={`pb-3 pt-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "logins"
                ? "border-gold text-gold"
                : "border-transparent text-beige/70 hover:text-cream"
            }`}
          >
            <UserCheck size={14} /> Logins Log ({logins.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 pt-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "users"
                ? "border-gold text-gold"
                : "border-transparent text-beige/70 hover:text-cream"
            }`}
          >
            <Users size={14} /> User Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("registrations")}
            className={`pb-3 pt-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "registrations"
                ? "border-gold text-gold"
                : "border-transparent text-beige/70 hover:text-cream"
            }`}
          >
            <Calendar size={14} /> Registrations ({registrations.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`pb-3 pt-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "messages"
                ? "border-gold text-gold"
                : "border-transparent text-beige/70 hover:text-cream"
            }`}
          >
            <Mail size={14} /> Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("firebase")}
            className={`pb-3 pt-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "firebase"
                ? "border-gold text-gold"
                : "border-transparent text-beige/70 hover:text-cream"
            }`}
          >
            <Database size={14} /> Firebase Console Links
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === "logins" && (
              <motion.div
                key="logins"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-beige/15 bg-brown/30 p-4 text-xs text-beige/80">
                  <p className="font-semibold text-gold">Where are login details in Firebase?</p>
                  <p className="mt-1">
                    Every successful sign-in is recorded in the <code className="text-gold font-mono">logins</code> collection and updates the user's profile in the <code className="text-gold font-mono">users</code> collection in Firestore.
                  </p>
                </div>

                {logins.length === 0 ? (
                  <p className="text-center py-12 text-sm text-beige/60">
                    {loading ? "Loading login records..." : "No logins recorded yet. Sign in with Google to create the first record."}
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-beige/15">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-beige/15 bg-brown/50 text-[11px] uppercase tracking-wider text-gold">
                        <tr>
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Method</th>
                          <th className="px-4 py-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-beige/10">
                        {logins.map((item) => (
                          <tr key={item.id} className="hover:bg-brown/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-cream">{item.displayName || "User"}</td>
                            <td className="px-4 py-3 text-beige/80">{item.email}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  item.role === "admin"
                                    ? "bg-gold/20 text-gold border border-gold/40"
                                    : "bg-sage/20 text-sage"
                                }`}
                              >
                                {item.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-beige/70">{item.loginMethod || "Google"}</td>
                            <td className="px-4 py-3 text-beige/60">
                              {new Date(item.loggedInAt).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {users.length === 0 ? (
                  <p className="text-center py-12 text-sm text-beige/60">No user accounts found yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-beige/15">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-beige/15 bg-brown/50 text-[11px] uppercase tracking-wider text-gold">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Member Since</th>
                          <th className="px-4 py-3">Last Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-beige/10">
                        {users.map((item) => (
                          <tr key={item.id} className="hover:bg-brown/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-cream">{item.displayName || "Member"}</td>
                            <td className="px-4 py-3 text-beige/80">{item.email}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  item.role === "admin"
                                    ? "bg-gold/20 text-gold border border-gold/40"
                                    : "bg-sage/20 text-sage"
                                }`}
                              >
                                {item.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-beige/60">
                              {new Date(item.createdAt).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-4 py-3 text-beige/60">
                              {item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString("en-IN") : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "registrations" && (
              <motion.div
                key="registrations"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {registrations.length === 0 ? (
                  <p className="text-center py-12 text-sm text-beige/60">
                    No event registrations recorded yet in Firestore.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-beige/15">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-beige/15 bg-brown/50 text-[11px] uppercase tracking-wider text-gold">
                        <tr>
                          <th className="px-4 py-3">Participant</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Event</th>
                          <th className="px-4 py-3">Registered At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-beige/10">
                        {registrations.map((item) => (
                          <tr key={item.id} className="hover:bg-brown/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-cream">{item.userName}</td>
                            <td className="px-4 py-3 text-beige/85">{item.userEmail}</td>
                            <td className="px-4 py-3 text-gold font-medium">{item.eventTitle}</td>
                            <td className="px-4 py-3 text-beige/60">
                              {new Date(item.registeredAt).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "messages" && (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {messages.length === 0 ? (
                  <p className="text-center py-12 text-sm text-beige/60">
                    No contact form messages recorded in Firestore yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-beige/15 bg-brown/20 p-4 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-cream text-sm">{item.name}</span>
                            <span className="text-beige/60 ml-2">({item.email})</span>
                          </div>
                          <span className="text-beige/50 text-[11px] flex items-center gap-1">
                            <Clock size={12} /> {new Date(item.createdAt).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="font-medium text-gold">{item.subject}</p>
                        <p className="text-beige/80 leading-relaxed bg-black/20 p-2.5 rounded-lg">
                          {item.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "firebase" && (
              <motion.div
                key="firebase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-sm"
              >
                <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
                  <h3 className="font-display text-lg font-semibold text-gold">
                    Why documents might not appear in Firebase Console by default
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-beige/85">
                    Firebase creates a specific named Firestore database for this application:
                  </p>
                  <p className="mt-2 font-mono text-xs bg-espresso/80 p-2.5 rounded border border-beige/20 text-cream">
                    ai-studio-techvedas-842b0c9a-a039-4d36-99fd-48594f58bcec
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-beige/85">
                    In the Firebase Console, the database selector at the top-left defaults to <code className="text-gold font-mono">(default)</code>, which is empty. You must switch the dropdown to select <code className="text-gold font-mono">ai-studio-techvedas-842b0c9a-a039-4d36-99fd-48594f58bcec</code>, or click the direct link below.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <a
                    href={FIRESTORE_CONSOLE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col justify-between rounded-xl border border-beige/20 bg-brown/30 p-5 transition-all hover:border-gold hover:bg-gold/10"
                  >
                    <div>
                      <span className="flex items-center justify-between text-gold font-semibold">
                        <span>Open Firestore Database</span>
                        <ExternalLink size={16} />
                      </span>
                      <p className="mt-2 text-xs text-beige/70 leading-relaxed">
                        Direct link to the <code className="text-gold">ai-studio-techvedas-...</code> database containing <code className="text-gold">users</code>, <code className="text-gold">logins</code>, <code className="text-gold">registrations</code>, and <code className="text-gold">messages</code>.
                      </p>
                    </div>
                    <span className="mt-4 text-xs font-semibold text-gold underline">View Firestore Documents →</span>
                  </a>

                  <a
                    href={AUTH_CONSOLE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col justify-between rounded-xl border border-beige/20 bg-brown/30 p-5 transition-all hover:border-gold hover:bg-gold/10"
                  >
                    <div>
                      <span className="flex items-center justify-between text-gold font-semibold">
                        <span>Open Authentication Console</span>
                        <ExternalLink size={16} />
                      </span>
                      <p className="mt-2 text-xs text-beige/70 leading-relaxed">
                        View registered users authenticated via Google Sign-In and check enabled sign-in providers.
                      </p>
                    </div>
                    <span className="mt-4 text-xs font-semibold text-gold underline">View Auth Users →</span>
                  </a>
                </div>

                <div className="rounded-xl border border-beige/15 bg-brown/20 p-5 text-xs space-y-2">
                  <h4 className="font-semibold text-cream text-sm">Need Email/Password Sign-In?</h4>
                  <p className="text-beige/75 leading-relaxed">
                    By default, Firebase projects provisioned through Google Cloud activate Google Sign-In. If you want users to sign in with regular passwords without Google:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-beige/80">
                    <li>Go to <a href={AUTH_CONSOLE_URL} target="_blank" rel="noreferrer" className="text-gold underline">Firebase Authentication</a></li>
                    <li>Click the <strong>Sign-in method</strong> tab</li>
                    <li>Click <strong>Add new provider</strong> → <strong>Email/Password</strong></li>
                    <li>Enable it and click <strong>Save</strong></li>
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
