interface MenuScreenProps {
  onStart: () => void;
}

export default function MenuScreen({ onStart }: MenuScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      <div className="text-center animate-fade-in">
        <div className="mb-2 tracking-[0.4em] text-xs font-mono text-[#63ffb4] opacity-60">ФИЗИЧЕСКИЙ ПЛАТФОРМЕР</div>
        <h1 className="font-russo text-7xl text-white mb-1 tracking-wider"
          style={{ textShadow: '0 0 40px #63ffb4, 0 0 80px #63ffb420' }}>
          GRAVITON
        </h1>
        <div className="text-[#63ffb4] text-sm tracking-[0.6em] mb-12 opacity-70">v 1.0</div>

        <div className="flex gap-8 justify-center mb-12 text-sm text-gray-400 tracking-widest">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border border-[#63ffb430] rounded flex items-center justify-center text-[#63ffb4]">↑</div>
            <span>ПРЫЖОК</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border border-[#63ffb430] rounded flex items-center justify-center text-[#63ffb4]">←</div>
            <span>ВЛЕВО</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border border-[#63ffb430] rounded flex items-center justify-center text-[#63ffb4]">→</div>
            <span>ВПРАВО</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-center mb-8 text-xs text-gray-500">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#4a9eff] inline-block"></span> Движущиеся платформы</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#ff6b3a] inline-block"></span> Рассыпающиеся</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#ff3355] inline-block"></span> Шипы</span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="px-16 py-4 text-xl font-russo tracking-widest text-black rounded-lg transition-all duration-200 hover:scale-105 animate-pulse-glow"
          style={{ background: 'linear-gradient(135deg, #63ffb4, #39d990)', boxShadow: '0 0 30px #63ffb450' }}
        >
          СТАРТ
        </button>

        <div className="mt-8 text-gray-600 text-xs tracking-wider">5 УРОВНЕЙ · ДИНАМИЧЕСКАЯ МУЗЫКА · ФИЗИКА</div>
      </div>
    </div>
  );
}
