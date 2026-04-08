// --- RSS parser (no dependency) ---

function getTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`);
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function parseRss(xml: string) {
  const items: { title: string; link: string; pubDate: string; source: string }[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const c = m[1];
    items.push({
      title: getTag(c, "title").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      link: getTag(c, "link"),
      pubDate: getTag(c, "pubDate"),
      source: getTag(c, "source"),
    });
  }
  return items;
}

// --- Fetch today's news from Google News RSS (French, economy/finance) ---

export interface NewsItem {
  title: string;
  link: string;
  time: string;
  source: string;
}

export async function getTodayNews(): Promise<NewsItem[]> {
  const feeds = [
    // Google News — Économie France
    "https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGx6TVdZU0JXWnlMVVpTR2dKR1VpZ0FQAQ?hl=fr&gl=FR&ceid=FR:fr",
    // Google News — Marchés financiers
    "https://news.google.com/rss/search?q=march%C3%A9s+financiers+bourse&hl=fr&gl=FR&ceid=FR:fr",
    // Google News — Géopolitique & conflits (impact marchés)
    "https://news.google.com/rss/search?q=guerre+OR+cessez-le-feu+OR+sanctions+OR+conflit+OR+OTAN+OR+embargo&hl=fr&gl=FR&ceid=FR:fr",
    // Google News — Pétrole, énergie, matières premières
    "https://news.google.com/rss/search?q=p%C3%A9trole+OR+OPEP+OR+gaz+OR+mati%C3%A8res+premi%C3%A8res+OR+or+cours&hl=fr&gl=FR&ceid=FR:fr",
    // Google News — Banques centrales & politique monétaire
    "https://news.google.com/rss/search?q=BCE+OR+Fed+OR+taux+directeur+OR+inflation+OR+banque+centrale&hl=fr&gl=FR&ceid=FR:fr",
    // Google News — À la Une (actualité générale majeure)
    "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0JXWnlMVVpTS0FBUAE?hl=fr&gl=FR&ceid=FR:fr",
  ];

  const allItems: NewsItem[] = [];

  for (const url of feeds) {
    try {
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = parseRss(xml);
      for (const item of items) {
        allItems.push({
          title: item.title,
          link: item.link,
          time: item.pubDate
            ? new Date(item.pubDate).toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" })
            : "",
          source: item.source,
        });
      }
    } catch {
      // skip failed feeds
    }
  }

  // Filter today (Paris) and deduplicate by title
  const todayParis = new Date().toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
  const seen = new Set<string>();

  return allItems.filter((item) => {
    if (seen.has(item.title)) return false;
    seen.add(item.title);
    // Keep all if we can't parse date, otherwise filter today
    if (!item.time) return true;
    try {
      const itemDate = new Date(item.link ? item.time : "").toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
      return itemDate === todayParis;
    } catch {
      return true;
    }
  });
}

// --- Economic calendar from Forex Factory (free JSON, no key) ---

export interface EconomicEvent {
  title: string;
  country: string;
  time: string; // HH:MM Paris
  impact: "High" | "Medium" | "Low" | string;
  forecast: string;
  previous: string;
}

export async function getEconomicCalendar(): Promise<EconomicEvent[]> {
  try {
    const res = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data: {
      title: string;
      country: string;
      date: string;
      impact: string;
      forecast: string;
      previous: string;
    }[] = await res.json();

    const todayParis = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" }); // YYYY-MM-DD

    return data
      .filter((ev) => {
        const evDate = new Date(ev.date).toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
        return evDate === todayParis;
      })
      .map((ev) => ({
        title: ev.title,
        country: ev.country,
        time: new Date(ev.date).toLocaleTimeString("fr-FR", {
          timeZone: "Europe/Paris",
          hour: "2-digit",
          minute: "2-digit",
        }),
        impact: ev.impact,
        forecast: ev.forecast || "—",
        previous: ev.previous || "—",
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  } catch {
    return [];
  }
}
