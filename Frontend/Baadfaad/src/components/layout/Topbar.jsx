import logo from '../../assets/Logo-01.png'

export default function Topbar() {
    return (
        <header className="w-full bg-white px-4 py-4 sm:px-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-emerald-100 bg-zinc-100 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                    <img
                        src={logo}
                        alt="BaadFaad logo"
                        className="h-8 w-8  object-cover"
                    />
                </div>

                <nav className="hidden items-center gap-10 md:flex">
                    <a href="#features" className="text-sm font-semibold text-black hover:text-slate-900">
                        Features
                    </a>
                    <a href="#how-it-works" className="text-sm font-semibold text-black hover:text-slate-900">
                        How It Works
                    </a>
                    <a href="#about" className="text-sm font-semibold text-black hover:text-slate-900">
                        About
                    </a>
                </nav>

                <button
                    type="button"
                    className="rounded-full bg-emerald-400 px-6 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 cursor-pointer"
                >
                    Start Splitting
                </button>
            </div>
        </header>
    );
}