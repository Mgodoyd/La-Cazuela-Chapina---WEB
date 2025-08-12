import { toast } from 'react-hot-toast';

export function confirmToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const id = toast.custom((t) => (
      <div className={`pointer-events-auto bg-white/90 backdrop-blur-xl text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-4 w-80 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <div className="text-sm font-medium mb-3">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => { toast.dismiss(id); resolve(false); }}
            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={() => { toast.dismiss(id); resolve(true); }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold"
          >
            Eliminar
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      position: 'bottom-right'
    });
  });
}


