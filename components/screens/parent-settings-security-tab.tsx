'use client';

import { useState } from 'react';

interface Props { childId: string | null; }

/** Security tab — PIN change, profile name, and child progress reset */
export function ParentSettingsSecurityTab({ childId }: Props) {
  // PIN change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [pinSaving, setPinSaving] = useState(false);

  // Profile name state
  const [name, setName] = useState('');
  const [nameMsg, setNameMsg] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  // Reset state
  const [showReset, setShowReset] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const handlePinChange = async () => {
    if (!/^\d{4}$/.test(newPin) || newPin !== confirmPin) {
      setPinMsg('PIN mới phải gồm 4 chữ số và khớp nhau');
      return;
    }
    setPinSaving(true);
    setPinMsg('');
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
        credentials: 'include',
      });
      const data = await res.json() as { error?: string };
      if (res.ok) {
        setPinMsg('✓ Đã đổi PIN');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        setPinMsg(data.error ?? 'Lỗi');
      }
    } catch {
      setPinMsg('Lỗi kết nối');
    } finally {
      setPinSaving(false);
    }
  };

  const handleNameSave = async () => {
    if (!name.trim()) return;
    setNameSaving(true);
    setNameMsg('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
        credentials: 'include',
      });
      if (res.ok) setNameMsg('✓ Đã lưu');
      else setNameMsg('Lỗi');
    } catch {
      setNameMsg('Lỗi kết nối');
    } finally {
      setNameSaving(false);
    }
  };

  const handleReset = async () => {
    if (!childId) return;
    try {
      const res = await fetch(`/api/children/${childId}/progress`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { setResetMsg('✓ Đã xóa tiến độ'); setShowReset(false); }
      else setResetMsg('Lỗi');
    } catch {
      setResetMsg('Lỗi kết nối');
    }
  };

  const sectionStyle = { background: '#fff', borderRadius: 16, padding: 16, border: '1px solid rgba(0,0,0,0.06)', marginBottom: 12 };
  const labelStyle = { fontSize: 13, fontWeight: 700, color: '#1F2A1F', marginBottom: 8, display: 'block' as const };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.15)', fontSize: 15, marginBottom: 8, boxSizing: 'border-box' as const };
  const btnStyle = (danger?: boolean) => ({ padding: '10px 20px', borderRadius: 10, background: danger ? '#C0392B' : '#2E5A3A', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' });

  return (
    <div style={{ paddingTop: 8 }}>
      {/* PIN Change */}
      <div style={sectionStyle}>
        <span style={labelStyle}>🔑 Đổi mã PIN</span>
        <input type="password" inputMode="numeric" maxLength={4} placeholder="PIN hiện tại" value={currentPin} onChange={e => setCurrentPin(e.target.value)} style={inputStyle} />
        <input type="password" inputMode="numeric" maxLength={4} placeholder="PIN mới" value={newPin} onChange={e => setNewPin(e.target.value)} style={inputStyle} />
        <input type="password" inputMode="numeric" maxLength={4} placeholder="Xác nhận PIN mới" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} style={inputStyle} />
        {pinMsg && <div style={{ fontSize: 13, color: pinMsg.startsWith('✓') ? '#2E5A3A' : '#C0392B', marginBottom: 8 }}>{pinMsg}</div>}
        <button onClick={handlePinChange} disabled={pinSaving} style={btnStyle()}>{pinSaving ? 'Đang lưu…' : 'Đổi PIN'}</button>
      </div>

      {/* Profile Name */}
      <div style={sectionStyle}>
        <span style={labelStyle}>👤 Tên cha mẹ</span>
        <input type="text" placeholder="Tên của bạn" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        {nameMsg && <div style={{ fontSize: 13, color: nameMsg.startsWith('✓') ? '#2E5A3A' : '#C0392B', marginBottom: 8 }}>{nameMsg}</div>}
        <button onClick={handleNameSave} disabled={nameSaving} style={btnStyle()}>{nameSaving ? 'Đang lưu…' : 'Lưu tên'}</button>
      </div>

      {/* Reset Progress */}
      <div style={sectionStyle}>
        <span style={labelStyle}>⚠️ Xóa tiến độ</span>
        <div style={{ fontSize: 13, color: '#6B7A6C', marginBottom: 12 }}>Xóa toàn bộ phiên chơi, ngôi sao và nhãn dán. Không thể hoàn tác.</div>
        {resetMsg && <div style={{ fontSize: 13, color: resetMsg.startsWith('✓') ? '#2E5A3A' : '#C0392B', marginBottom: 8 }}>{resetMsg}</div>}
        <button onClick={() => setShowReset(true)} style={btnStyle(true)}>Xóa tất cả tiến độ</button>
      </div>

      {/* Reset confirmation overlay */}
      {showReset && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 300, width: '85%', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1F2A1F', marginBottom: 8 }}>Xóa tiến độ?</div>
            <div style={{ fontSize: 13, color: '#6B7A6C', marginBottom: 20, lineHeight: 1.5 }}>Toàn bộ phiên chơi, ngôi sao và nhãn dán sẽ bị xóa. Không thể hoàn tác.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowReset(false)} style={{ flex: 1, padding: 12, borderRadius: 10, background: '#F0EADC', color: '#1F2A1F', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleReset} style={{ flex: 1, padding: 12, borderRadius: 10, background: '#C0392B', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
