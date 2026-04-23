interface GameMenuProps {
  onStart: () => void;
}

export default function GameMenu({ onStart }: GameMenuProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 animate-fade-in"
      style={{ background: 'radial-gradient(ellipse at center, rgba(80,120,180,0.25), rgba(10,15,30,0.9))' }}>
      <div className="text-center">
        <div className="mb-3 tracking-[0.5em] text-xs font-mono text-[#ffdd44] opacity-70">PHYSICS · BALL · ADVENTURE</div>
        <h1 className="font-russo text-[88px] leading-none text-white mb-2 tracking-wider"
          style={{ textShadow: '0 4px 0 #8a6030, 0 8px 30px rgba(0,0,0,0.8), 0 0 60px #ffdd4430' }}>
          BALLANCE
        </h1>
        <div className="text-[#c8a878] text-sm tracking-[0.7em] mb-10 opacity-80">МЕТАЛЛ · ДЕРЕВО · КАМЕНЬ</div>

        {/* Ball preview */}
        <div className="flex justify-center mb-10">
          <div className="w-20 h-20 rounded-full animate-float relative"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #f0f0f0, #a0a0a0 40%, #404040 85%)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset -5px -8px 15px rgba(0,0,0,0.5)'
            }}>
            <div className="absolute top-2 left-3 w-4 h-3 rounded-full bg-white/70 blur-[1px]" />
          </div>
        </div>

        <div className="flex gap-6 justify-center mb-10 text-xs text-gray-400 tracking-widest">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border border-[#c8a87840] rounded bg-[#c8a87810] flex items-center justify-center text-[#ffdd44]">←→</div>
            <span>КАТИТЬ</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border border-[#c8a87840] rounded bg-[#c8a87810] flex items-center justify-center text-[#ffdd44]">⎵</div>
            <span>ПРЫЖОК</span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="px-20 py-4 text-xl font-russo tracking-widest text-[#3e2a0e] rounded-md transition-all duration-200 hover:scale-105 hover:brightness-110"
          style={{
            background: 'linear-gradient(180deg, #ffe680 0%, #ffc040 50%, #d89020 100%)',
            boxShadow: '0 6px 0 #8a5a10, 0 10px 25px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)'
          }}
        >
          ИГРАТЬ
        </button>

        <div className="mt-8 text-gray-500 text-xs tracking-[0.3em]">5 УРОВНЕЙ · БОНУСЫ · ФИЗИКА ШАРА</div>
      </div>
    </div>
  );
}
