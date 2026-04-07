import { getTodayNews, getEconomicCalendar } from "@/lib/news";
import type { EconomicEvent } from "@/lib/news";

function ImpactBadge({ impact }: { impact: string }) {
  const colors: Record<string, string> = {
    High: "bg-red-500/20 text-red-400 border-red-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Low: "bg-green-500/20 text-green-400 border-green-500/30",
  };
  const cls = colors[impact] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${cls}`}>
      {impact}
    </span>
  );
}

function EventRow({ ev }: { ev: EconomicEvent }) {
  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50">
      <td className="py-3 px-4 font-mono text-sm text-blue-400 whitespace-nowrap">{ev.time}</td>
      <td className="py-3 px-4 text-xs text-gray-500 uppercase">{ev.country}</td>
      <td className="py-3 px-4">
        <ImpactBadge impact={ev.impact} />
      </td>
      <td className="py-3 px-4 text-sm">{ev.title}</td>
      <td className="py-3 px-4 text-sm text-gray-400">{ev.forecast}</td>
      <td className="py-3 px-4 text-sm text-gray-400">{ev.previous}</td>
    </tr>
  );
}

export default async function NewsPage() {
  const [news, calendar] = await Promise.all([getTodayNews(), getEconomicCalendar()]);

  const now = new Date().toLocaleTimeString("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  });

  const pastEvents = calendar.filter((ev) => ev.time <= now);
  const upcomingEvents = calendar.filter((ev) => ev.time > now);

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">News</h1>
      <p className="text-gray-400 mb-8">
        Actualités et calendrier économique — {new Date().toLocaleDateString("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>

      {/* Upcoming economic events */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Événements à venir aujourd&apos;hui
        </h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun événement programmé pour le reste de la journée.</p>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase">
                  <th className="py-3 px-4">Heure</th>
                  <th className="py-3 px-4">Pays</th>
                  <th className="py-3 px-4">Impact</th>
                  <th className="py-3 px-4">Événement</th>
                  <th className="py-3 px-4">Prévu</th>
                  <th className="py-3 px-4">Préc.</th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((ev, i) => (
                  <EventRow key={i} ev={ev} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Past economic events */}
      {pastEvents.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-400">Événements passés</h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto opacity-70">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 text-xs text-gray-500 uppercase">
                  <th className="py-3 px-4">Heure</th>
                  <th className="py-3 px-4">Pays</th>
                  <th className="py-3 px-4">Impact</th>
                  <th className="py-3 px-4">Événement</th>
                  <th className="py-3 px-4">Prévu</th>
                  <th className="py-3 px-4">Préc.</th>
                </tr>
              </thead>
              <tbody>
                {pastEvents.map((ev, i) => (
                  <EventRow key={i} ev={ev} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* News */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Actualités du jour</h2>
        {news.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune actualité récupérée.</p>
        ) : (
          <div className="space-y-2">
            {news.slice(0, 40).map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-600 transition-colors"
              >
                <span className="text-xs text-gray-500 font-mono whitespace-nowrap mt-0.5">
                  {item.time}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{item.title}</p>
                  {item.source && (
                    <p className="text-xs text-gray-500 mt-1">{item.source}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
