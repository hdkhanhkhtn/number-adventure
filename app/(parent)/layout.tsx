/** Parent area layout — warm gray bg, Be Vietnam Pro font */
export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-parent text-[#1F2A1F]" style={{ background: '#F5F3ED' }}>
      {children}
    </div>
  );
}
