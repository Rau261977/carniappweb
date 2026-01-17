import React, { useState, useEffect } from 'react';

interface BookingFormProps {
  apiUrl: string;
  sessionId: string;
  onComplete: (message: string) => void;
  onCancel: () => void;
}

interface AvailableSlot {
  time: string;
  available: boolean;
}

export function BookingForm({ apiUrl, sessionId, onComplete, onCancel }: BookingFormProps) {
  const [step, setStep] = useState<'date' | 'time' | 'details'>('date');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Get next 5 weekdays
  const getNextWeekdays = () => {
    const dates: { date: string; label: string }[] = [];
    const today = new Date();
    let daysAdded = 0;
    let currentDate = new Date(today);
    
    while (daysAdded < 5) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
        dates.push({
          date: currentDate.toISOString().split('T')[0],
          label: currentDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })
        });
        daysAdded++;
      }
    }
    return dates;
  };

  const weekdays = getNextWeekdays();

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${apiUrl}/api/appointments/available?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.available_times || []);
        setStep('time');
      } else {
        setError('Error al cargar horarios');
      }
    } catch (e) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/api/appointments/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          appointment_date: selectedDate,
          time_slot: selectedTime,
          session_id: sessionId
        })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        const dateStr = new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { 
          weekday: 'long', day: 'numeric', month: 'long' 
        });
        onComplete(`✅ **¡Cita confirmada!**\n\n📅 ${dateStr}\n🕐 ${selectedTime} hs\n📧 Te enviamos confirmación a ${email}`);
      } else {
        setError(data.error || 'Error al reservar');
      }
    } catch (e) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  const formStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    borderRadius: '12px',
    padding: '16px',
    margin: '8px 0'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s'
  };

  const primaryButton: React.CSSProperties = {
    ...buttonStyle,
    background: '#0284c7',
    color: 'white'
  };

  const secondaryButton: React.CSSProperties = {
    ...buttonStyle,
    background: '#e2e8f0',
    color: '#475569'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    marginBottom: '10px',
    fontSize: '14px'
  };

  return (
    <div style={formStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontWeight: 600, color: '#0369a1' }}>📅 Agendar Demo</span>
        <button onClick={onCancel} style={{ ...secondaryButton, padding: '4px 8px', fontSize: '12px' }}>✕</button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {step === 'date' && (
        <div>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Seleccioná un día:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {weekdays.map(({ date, label }) => (
              <button
                key={date}
                onClick={() => handleDateSelect(date)}
                disabled={loading}
                style={{
                  ...secondaryButton,
                  textAlign: 'left',
                  textTransform: 'capitalize'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'time' && (
        <div>
          <button onClick={() => setStep('date')} style={{ ...secondaryButton, marginBottom: '12px', fontSize: '12px' }}>
            ← Cambiar día
          </button>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Horarios disponibles:</p>
          {availableSlots.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>No hay horarios disponibles para este día</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  style={{ ...secondaryButton, minWidth: '70px' }}
                >
                  {time} hs
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'details' && (
        <form onSubmit={handleSubmit}>
          <button type="button" onClick={() => setStep('time')} style={{ ...secondaryButton, marginBottom: '12px', fontSize: '12px' }}>
            ← Cambiar horario
          </button>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Completá tus datos:</p>
          
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={inputStyle}
          />
          
          <button
            type="submit"
            disabled={loading || !name || !email || !phone}
            style={{ ...primaryButton, width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Reservando...' : '✓ Confirmar Cita'}
          </button>
        </form>
      )}

      {loading && step !== 'details' && (
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '12px' }}>Cargando...</p>
      )}
    </div>
  );
}
