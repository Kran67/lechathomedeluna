export function uuid() {
    const _p8 = (s) => {
        const p = (`${Math.random().toString(16)}000000000`).substring(2, 8);
        return s ? `-${p.substring(0, 4)}-${p.substring(4, 4)}` : p;
    }
    return _p8() + _p8(!0) + _p8(!0) + _p8();
}

export const statusFromError = (e) =>{
  if (e && e.status) return e.status;
  if (e && e.message && /(UNIQUE|PRIMARY KEY)/i.test(e.message)) return 409;
  return 500;
}