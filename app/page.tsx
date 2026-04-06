export default function Home() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">Accueil</h1>
      <p className="text-gray-400 mb-8">Bienvenue sur le dashboard.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cartes placeholder — à remplir */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <p className="text-sm text-gray-500 mb-1">À venir</p>
          <p className="text-2xl font-bold">—</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <p className="text-sm text-gray-500 mb-1">À venir</p>
          <p className="text-2xl font-bold">—</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <p className="text-sm text-gray-500 mb-1">À venir</p>
          <p className="text-2xl font-bold">—</p>
        </div>
      </div>
    </div>
  );
}
