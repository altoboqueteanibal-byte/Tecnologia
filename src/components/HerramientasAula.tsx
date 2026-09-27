import React, { useState, useEffect, useRef } from 'react';
import { Grupo, Estudiante } from '../types';
import { 
  Users, 
  Clock, 
  Volume2, 
  Shuffle, 
  RotateCcw, 
  Play, 
  Pause, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  Printer, 
  HelpCircle,
  Flame,
  ThumbsUp
} from 'lucide-react';

interface HerramientasAulaProps {
  grupo: Grupo;
  docente: string;
}

export const HerramientasAula: React.FC<HerramientasAulaProps> = ({
  grupo,
  docente
}) => {
  const [herramientaActiva, setHerramientaActiva] = useState<'ruleta' | 'temporizador' | 'equipos' | 'ruido' | 'semaforo'>('ruleta');

  const estudiantes = grupo.estudiantes || [];

  // ==========================================
  // 1. SELECTOR ALEATORIO / RULETA
  // ==========================================
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);
  const [estaGirando, setEstaGirando] = useState(false);
  const [participantesIds, setParticipantesIds] = useState<string[]>([]);
  const [historialParticipacion, setHistorialParticipacion] = useState<{ id: string; nombre: string; hora: string; tipo: 'bien' | 'reforzar' }[]>([]);

  const estudiantesPendientes = estudiantes.filter(e => !participantesIds.includes(e.id));

  const girarRuleta = () => {
    if (estudiantes.length === 0) return;
    
    // Choose pool
    const pool = estudiantesPendientes.length > 0 ? estudiantesPendientes : estudiantes;
    if (pool.length === 0) return;

    setEstaGirando(true);
    setEstudianteSeleccionado(null);

    let counter = 0;
    const maxSteps = 24 + Math.floor(Math.random() * 8);
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * pool.length);
      setEstudianteSeleccionado(pool[randomIdx]);
      counter++;

      if (counter >= maxSteps) {
        clearInterval(interval);
        const finalEstudiante = pool[Math.floor(Math.random() * pool.length)];
        setEstudianteSeleccionado(finalEstudiante);
        setEstaGirando(false);
        // Play celebratory chime via Web Audio
        playBeep(523.25, 0.15, 'sine', () => {
          playBeep(659.25, 0.15, 'sine', () => {
            playBeep(783.99, 0.35, 'triangle');
          });
        });
      }
    }, 80);
  };

  const registrarParticipacion = (tipo: 'bien' | 'reforzar') => {
    if (!estudianteSeleccionado) return;
    if (!participantesIds.includes(estudianteSeleccionado.id)) {
      setParticipantesIds(prev => [...prev, estudianteSeleccionado.id]);
    }
    const ahora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistorialParticipacion(prev => [
      { id: Date.now().toString(), nombre: estudianteSeleccionado.nombre, hora: ahora, tipo },
      ...prev
    ]);
  };

  const reiniciarRondaParticipacion = () => {
    setParticipantesIds([]);
    setEstudianteSeleccionado(null);
  };

  // ==========================================
  // 2. TEMPORIZADOR DE AULA
  // ==========================================
  const [tiempoTotal, setTiempoTotal] = useState<number>(300); // 5 min
  const [tiempoRestante, setTiempoRestante] = useState<number>(300);
  const [timerCorriendo, setTimerCorriendo] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (timerCorriendo) {
      timerRef.current = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerCorriendo(false);
            // Alarm sound
            playSchoolBell();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerCorriendo]);

  const setearTiempo = (segundos: number) => {
    setTimerCorriendo(false);
    setTiempoTotal(segundos);
    setTiempoRestante(segundos);
  };

  const toggleTimer = () => {
    if (tiempoRestante === 0) {
      setTiempoRestante(tiempoTotal);
    }
    setTimerCorriendo(!timerCorriendo);
  };

  const formatTiempo = (totalSegundos: number) => {
    const mins = Math.floor(totalSegundos / 60);
    const segs = totalSegundos % 60;
    return `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  };

  // Web Audio Synthesis for alert sounds
  const playBeep = (freq: number, duration: number, type: OscillatorType = 'sine', callback?: () => void) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      if (callback) {
        setTimeout(callback, duration * 1000);
      }
    } catch (e) {
      // Audio might be blocked by browser policy until interaction
    }
  };

  const playSchoolBell = () => {
    // Sequence of dings
    [440, 554, 659, 880].forEach((freq, i) => {
      setTimeout(() => {
        playBeep(freq, 0.4, 'triangle');
      }, i * 220);
    });
  };

  // ==========================================
  // 3. GENERADOR DE EQUIPOS DINÁMICOS
  // ==========================================
  const [numEquipos, setNumEquipos] = useState<number>(3);
  const [equiposGenerados, setEquiposGenerados] = useState<{ id: number; nombre: string; miembros: Estudiante[] }[]>([]);
  const [copiadoEquipos, setCopiadoEquipos] = useState(false);

  const nombresTematicos = [
    'Equipo Algoritmos',
    'Equipo Robótica',
    'Equipo Hardware',
    'Equipo Ciberseguridad',
    'Equipo Innovación',
    'Equipo Microchips',
    'Equipo Código',
    'Equipo Redes'
  ];

  const generarEquipos = () => {
    if (estudiantes.length === 0) return;
    const shuffled = [...estudiantes].sort(() => Math.random() - 0.5);
    const resultado: { id: number; nombre: string; miembros: Estudiante[] }[] = [];

    for (let i = 0; i < numEquipos; i++) {
      resultado.push({
        id: i + 1,
        nombre: nombresTematicos[i % nombresTematicos.length] || `Equipo ${i + 1}`,
        miembros: []
      });
    }

    shuffled.forEach((est, idx) => {
      const eqIdx = idx % numEquipos;
      resultado[eqIdx].miembros.push(est);
    });

    setEquiposGenerados(resultado);
  };

  const copiarEquiposAlPortapapeles = () => {
    if (equiposGenerados.length === 0) return;
    let texto = `📋 GRUPOS DE TRABAJO - ${grupo.nombre}\n\n`;
    equiposGenerados.forEach(eq => {
      texto += `🔹 ${eq.nombre} (${eq.miembros.length} integrantes):\n`;
      eq.miembros.forEach((m, i) => {
        texto += `   ${i + 1}. ${m.nombre}\n`;
      });
      texto += `\n`;
    });

    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoEquipos(true);
      setTimeout(() => setCopiadoEquipos(false), 2000);
    });
  };

  // ==========================================
  // 4. MEDIDOR DE NIVEL DE RUIDO DE AULA
  // ==========================================
  const [micActivo, setMicActivo] = useState(false);
  const [nivelRuido, setNivelRuido] = useState<number>(15); // 0 to 100
  const [umbralRuido, setUmbralRuido] = useState<number>(65);
  const [alertasRuidoExcedido, setAlertasRuidoExcedido] = useState<number>(0);
  const audioContextRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<any>(null);

  const iniciarMicrofono = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setMicActivo(true);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      let cooldown = false;

      const actualizarNivel = () => {
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setNivelRuido(normalized);

        if (normalized > umbralRuido && !cooldown) {
          cooldown = true;
          setAlertasRuidoExcedido(prev => prev + 1);
          playBeep(250, 0.2, 'sawtooth');
          setTimeout(() => {
            cooldown = false;
          }, 2500);
        }

        animFrameRef.current = requestAnimationFrame(actualizarNivel);
      };

      actualizarNivel();
    } catch (err) {
      alert('No se pudo acceder al micrófono. Puede que no esté disponible o no se otorgó permiso.');
      setMicActivo(false);
    }
  };

  const detenerMicrofono = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setMicActivo(false);
    setNivelRuido(10);
  };

  useEffect(() => {
    return () => {
      detenerMicrofono();
    };
  }, []);

  // ==========================================
  // 5. SEMÁFORO DE DINÁMICA DE AULA
  // ==========================================
  const [estadoSemaforo, setEstadoSemaforo] = useState<'rojo' | 'amarillo' | 'verde' | 'azul'>('verde');

  const dinámicas = {
    rojo: {
      color: 'bg-rose-500',
      border: 'border-rose-400',
      badge: 'Silencio Total / Explicación del Docente',
      desc: 'Atención al frente. Momento de instrucción guiada, lectura reflexiva o evaluación individual.'
    },
    amarillo: {
      color: 'bg-amber-500',
      border: 'border-amber-400',
      badge: 'Voz Baja / Murmullo Aceptable',
      desc: 'Consultas con el compañero de al lado. Trabajo en parejas a volumen moderado.'
    },
    verde: {
      color: 'bg-emerald-500',
      border: 'border-emerald-400',
      badge: 'Trabajo Colaborativo / Diálogo en Equipos',
      desc: 'Intercambio activo de ideas en grupos. Trabajo de taller, debates y proyectos.'
    },
    azul: {
      color: 'bg-blue-500',
      border: 'border-blue-400',
      badge: 'Preguntas y Participación Abierta',
      desc: 'Levantar la mano para intervenir, aportar ejemplos o resolver dudas en plenaria.'
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Selector of Classroom Tools */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c9a84c]" />
              HERRAMIENTAS DINÁMICAS DE AULA
            </h2>
            <p className="text-xs text-slate-500">
              Recursos interactivos para dinamizar la clase, controlar tiempos y organizar dinámicas con <span className="font-semibold text-slate-700">{grupo.nombre}</span> ({estudiantes.length} estudiantes).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              Docente: {docente}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => setHerramientaActiva('ruleta')}
            className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
              herramientaActiva === 'ruleta'
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Shuffle className={`w-4 h-4 ${herramientaActiva === 'ruleta' ? 'text-amber-600' : 'text-slate-500'}`} />
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded">
                Aleatorio
              </span>
            </div>
            <span className="text-xs font-bold leading-tight">Ruleta de Estudiantes</span>
          </button>

          <button
            onClick={() => setHerramientaActiva('temporizador')}
            className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
              herramientaActiva === 'temporizador'
                ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Clock className={`w-4 h-4 ${herramientaActiva === 'temporizador' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                Tiempo
              </span>
            </div>
            <span className="text-xs font-bold leading-tight">Temporizador de Clase</span>
          </button>

          <button
            onClick={() => setHerramientaActiva('equipos')}
            className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
              herramientaActiva === 'equipos'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Users className={`w-4 h-4 ${herramientaActiva === 'equipos' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                Grupos
              </span>
            </div>
            <span className="text-xs font-bold leading-tight">Generador de Equipos</span>
          </button>

          <button
            onClick={() => setHerramientaActiva('ruido')}
            className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
              herramientaActiva === 'ruido'
                ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Volume2 className={`w-4 h-4 ${herramientaActiva === 'ruido' ? 'text-purple-600' : 'text-slate-500'}`} />
              <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100/60 px-1.5 py-0.5 rounded">
                Micro
              </span>
            </div>
            <span className="text-xs font-bold leading-tight">Semáforo de Ruido</span>
          </button>

          <button
            onClick={() => setHerramientaActiva('semaforo')}
            className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
              herramientaActiva === 'semaforo'
                ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Flame className={`w-4 h-4 ${herramientaActiva === 'semaforo' ? 'text-rose-600' : 'text-slate-500'}`} />
              <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100/60 px-1.5 py-0.5 rounded">
                Visual
              </span>
            </div>
            <span className="text-xs font-bold leading-tight">Dinámica de Clase</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SELECTOR ALEATORIO / RULETA */}
      {/* ========================================================= */}
      {herramientaActiva === 'ruleta' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Participación Equitativa
              </span>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {participantesIds.length} / {estudiantes.length} ya participaron
              </span>
            </div>

            {/* Display Card */}
            <div className="my-8 w-full max-w-lg min-h-[220px] rounded-2xl border-2 border-dashed border-amber-300 bg-gradient-to-b from-amber-50/70 to-amber-100/40 p-8 flex flex-col items-center justify-center transition-all">
              {estaGirando ? (
                <div className="animate-pulse space-y-3">
                  <div className="text-sm font-bold text-amber-700 uppercase tracking-widest animate-bounce">
                    ¡Eligiendo al azar...!
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight px-4 py-2 bg-white/80 rounded-xl shadow-xs border border-amber-200">
                    {estudianteSeleccionado ? estudianteSeleccionado.nombre : '...'}
                  </div>
                </div>
              ) : estudianteSeleccionado ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" /> ¡Estudiante Seleccionado!
                  </div>
                  <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {estudianteSeleccionado.nombre}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Cédula: {estudianteSeleccionado.cedula}
                  </div>

                  {/* Feedback action buttons */}
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => registrarParticipacion('bien')}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Participó Correctamente
                    </button>
                    <button
                      onClick={() => registrarParticipacion('reforzar')}
                      className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Necesita Refuerzo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-slate-400">
                  <Shuffle className="w-12 h-12 mx-auto text-amber-400 opacity-80" />
                  <p className="text-sm font-semibold text-slate-600">
                    Presiona el botón para elegir un estudiante al azar para responder o participar
                  </p>
                  <p className="text-xs text-slate-400">
                    Garantiza que todos los estudiantes tengan la oportunidad de participar activamente.
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={girarRuleta}
                disabled={estaGirando || estudiantes.length === 0}
                className="px-6 py-3 rounded-xl bg-[#0a1628] hover:bg-[#1a2d4b] text-white font-extrabold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Shuffle className="w-4 h-4 text-[#c9a84c]" />
                {estaGirando ? 'Eligiendo...' : '¡Elegir Estudiante al Azar!'}
              </button>

              <button
                onClick={reiniciarRondaParticipacion}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                title="Reiniciar lista de participación para empezar de nuevo"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Ronda
              </button>
            </div>
          </div>

          {/* Side Panel: Participation History & Pending */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col">
            <h3 className="text-xs font-black uppercase text-slate-600 tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Bitácora de Participación Hoy
            </h3>

            <div className="flex-1 overflow-y-auto max-h-[360px] divide-y divide-slate-100 pr-1">
              {historialParticipacion.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Aún no se han registrado participaciones en esta sesión.
                </div>
              ) : (
                historialParticipacion.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{item.nombre}</span>
                      <span className="text-[10px] text-slate-400 block">{item.hora}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.tipo === 'bien' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.tipo === 'bien' ? '🌟 Destacó' : '💡 Refuerzo'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-2 text-xs text-slate-500">
              <span className="font-bold text-slate-700">Pendientes por participar ({estudiantesPendientes.length}):</span>
              <div className="flex flex-wrap gap-1 mt-2 max-h-24 overflow-y-auto">
                {estudiantesPendientes.map(e => (
                  <span key={e.id} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {e.nombre.split(',')[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TEMPORIZADOR DE AULA */}
      {/* ========================================================= */}
      {herramientaActiva === 'temporizador' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-xl flex flex-col items-center">
            {/* Presets */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {[
                { label: '1 min (Rápido)', secs: 60 },
                { label: '2 min (Pregunta)', secs: 120 },
                { label: '5 min (Actividad)', secs: 300 },
                { label: '10 min (Taller)', secs: 600 },
                { label: '15 min (Práctica)', secs: 900 },
                { label: '20 min (Reto)', secs: 1200 }
              ].map(preset => (
                <button
                  key={preset.secs}
                  onClick={() => setearTiempo(preset.secs)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    tiempoTotal === preset.secs
                      ? 'bg-[#0a1628] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Giant Digital Clock */}
            <div className={`text-6xl sm:text-8xl font-black font-mono tracking-tight my-4 transition-colors ${
              tiempoRestante === 0 
                ? 'text-rose-600 animate-pulse' 
                : tiempoRestante <= 60 
                  ? 'text-amber-600' 
                  : 'text-slate-800'
            }`}>
              {formatTiempo(tiempoRestante)}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 mb-8 overflow-hidden border border-slate-200">
              <div 
                className={`h-full transition-all duration-1000 ${
                  tiempoRestante <= 60 ? 'bg-rose-500' : tiempoRestante <= 180 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(tiempoRestante / (tiempoTotal || 1)) * 100}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTimer}
                className={`px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                  timerCorriendo 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-[#0a1628] hover:bg-[#1a2d4b] text-white'
                }`}
              >
                {timerCorriendo ? (
                  <>
                    <Pause className="w-4 h-4" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-[#c9a84c]" /> Iniciar Temporizador
                  </>
                )}
              </button>

              <button
                onClick={() => setearTiempo(tiempoTotal)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reiniciar
              </button>

              <button
                onClick={playSchoolBell}
                className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1.5 transition-all"
                title="Probar sonido de campana de aula"
              >
                <Volume2 className="w-4 h-4 text-slate-500" /> Timbre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. GENERADOR DE EQUIPOS DINÁMICOS */}
      {/* ========================================================= */}
      {herramientaActiva === 'equipos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Configuración de Equipos de Trabajo
                </h3>
                <p className="text-xs text-slate-500">
                  Divide automáticamente a los {estudiantes.length} estudiantes en grupos equilibrados y colaborativos.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Número de Equipos:</label>
                <select
                  value={numEquipos}
                  onChange={(e) => setNumEquipos(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  <option value={2}>2 Equipos</option>
                  <option value={3}>3 Equipos</option>
                  <option value={4}>4 Equipos</option>
                  <option value={5}>5 Equipos</option>
                  <option value={6}>6 Equipos</option>
                  <option value={8}>8 Equipos</option>
                </select>

                <button
                  onClick={generarEquipos}
                  className="px-4 py-2 rounded-lg bg-[#0a1628] hover:bg-[#1a2d4b] text-white text-xs font-black flex items-center gap-1.5 shadow-xs"
                >
                  <Shuffle className="w-3.5 h-3.5 text-[#c9a84c]" /> ¡Generar Equipos!
                </button>
              </div>
            </div>

            {equiposGenerados.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">
                  Aún no se han generado los equipos para este grupo.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Selecciona la cantidad de equipos deseada y haz clic en "¡Generar Equipos!".
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-slate-600 uppercase">
                    Equipos Formados ({equiposGenerados.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copiarEquiposAlPortapapeles}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      {copiadoEquipos ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiadoEquipos ? '¡Copiado!' : 'Copiar Lista'}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all no-print"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimir
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {equiposGenerados.map((eq, idx) => (
                    <div
                      key={eq.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow"
                    >
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                        <span className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black">
                            {idx + 1}
                          </span>
                          {eq.nombre}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {eq.miembros.length} estud.
                        </span>
                      </div>

                      <ol className="space-y-1.5 text-xs text-slate-700">
                        {eq.miembros.map((m, mIdx) => (
                          <li key={m.id} className="flex items-center gap-2 p-1.5 rounded bg-slate-50 hover:bg-slate-100">
                            <span className="text-[10px] text-slate-400 font-mono w-4">{mIdx + 1}.</span>
                            <span className="font-semibold text-slate-800 truncate">{m.nombre}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MEDIDOR DE NIVEL DE RUIDO DE AULA */}
      {/* ========================================================= */}
      {herramientaActiva === 'ruido' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 text-center max-w-2xl mx-auto">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">
            Semáforo y Medidor de Nivel de Ruido en Vivo
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Utiliza el micrófono del equipo para medir en tiempo real el volumen ambiental del aula y avisar a los estudiantes cuando sobrepasen el límite.
          </p>

          <div className="my-6 flex flex-col items-center">
            {/* Visual Gauge */}
            <div className="w-full bg-slate-100 rounded-full h-8 overflow-hidden border border-slate-300 relative shadow-inner">
              <div
                className={`h-full transition-all duration-150 ${
                  nivelRuido > umbralRuido
                    ? 'bg-rose-500'
                    : nivelRuido > umbralRuido - 20
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(5, Math.min(100, nivelRuido))}%` }}
              />
              <div 
                className="absolute top-0 bottom-0 w-1 bg-red-800 z-10"
                style={{ left: `${umbralRuido}%` }}
                title="Umbral de ruido máximo tolerado"
              />
            </div>

            <div className="w-full flex justify-between text-[11px] font-bold text-slate-400 mt-2">
              <span>Silencio (0 dB)</span>
              <span className="text-red-600 font-black">Límite ({umbralRuido}%)</span>
              <span>100% Volumen</span>
            </div>

            {/* Status indicator */}
            <div className="mt-6 flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 ${
                nivelRuido > umbralRuido
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-bounce'
                  : nivelRuido > umbralRuido - 20
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {nivelRuido > umbralRuido ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> ¡Demasiado Ruido en el Aula!
                  </>
                ) : nivelRuido > umbralRuido - 20 ? (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-600" /> Volumen Aceptable
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Excelente Concentración y Silencio
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Alertas de exceso de volumen: <strong className="text-slate-800">{alertasRuidoExcedido}</strong>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
            {micActivo ? (
              <button
                onClick={detenerMicrofono}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <MicOff className="w-4 h-4" /> Detener Medición
              </button>
            ) : (
              <button
                onClick={iniciarMicrofono}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <Mic className="w-4 h-4" /> Iniciar Medidor de Ruido (Micrófono)
              </button>
            )}

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span>Sensibilidad:</span>
              <input
                type="range"
                min="30"
                max="90"
                value={umbralRuido}
                onChange={(e) => setUmbralRuido(parseInt(e.target.value, 10))}
                className="w-28 accent-amber-600 cursor-pointer"
              />
              <span className="w-8">{umbralRuido}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SEMÁFORO DE DINÁMICA DE AULA */}
      {/* ========================================================= */}
      {herramientaActiva === 'semaforo' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
              Semáforo de Instrucción y Dinámica de Aula
            </h3>
            <p className="text-xs text-slate-500">
              Muestra en la pantalla o proyector el estado actual de la clase para guiar visualmente la conducta y participación.
            </p>
          </div>

          {/* Giant Traffic Light Card */}
          <div className="p-8 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden mb-8">
            <div className={`w-20 h-20 rounded-full ${dinámicas[estadoSemaforo].color} shadow-lg shadow-current/50 mb-4 animate-pulse flex items-center justify-center`}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h4 className="text-2xl font-black tracking-tight mb-2">
              {dinámicas[estadoSemaforo].badge}
            </h4>

            <p className="text-sm text-slate-300 max-w-md leading-relaxed">
              {dinámicas[estadoSemaforo].desc}
            </p>
          </div>

          {/* Mode Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setEstadoSemaforo('rojo')}
              className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                estadoSemaforo === 'rojo'
                  ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-rose-500 mx-auto mb-1.5" />
              <span>Silencio / Explicación</span>
            </button>

            <button
              onClick={() => setEstadoSemaforo('amarillo')}
              className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                estadoSemaforo === 'amarillo'
                  ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-1.5" />
              <span>Voz Baja / Parejas</span>
            </button>

            <button
              onClick={() => setEstadoSemaforo('verde')}
              className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                estadoSemaforo === 'verde'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1.5" />
              <span>Trabajo en Equipos</span>
            </button>

            <button
              onClick={() => setEstadoSemaforo('azul')}
              className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                estadoSemaforo === 'azul'
                  ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-1.5" />
              <span>Preguntas Abiertas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
