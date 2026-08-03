import { useState } from 'react';
import axios from 'axios';
import { Send, ShieldAlert, ShieldCheck, Loader2, Mail } from 'lucide-react';

function App() {
  const [emailText, setEmailText] = useState('');
  const [result, setResult] = useState<{ spam_probability: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!emailText.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/predict', {
        message: emailText
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-[#0a0f1c] to-black flex flex-col items-center justify-center p-4 sm:p-8 font-sans text-slate-100">
      
      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="bg-white/5 border-b border-white/10 p-6 sm:p-8 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl shadow-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Spam Shield <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Enterprise-grade threat detection.
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="p-6 sm:p-8 flex-grow flex flex-col gap-5">
          <textarea
            className="w-full h-40 sm:h-52 p-4 sm:p-5 bg-black/40 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-slate-200 placeholder-slate-600 resize-none transition-all duration-300"
            placeholder="Paste message contents here for security analysis..."
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
          />

          {error && (
            <div className="text-rose-400 text-sm font-medium px-1">
              {error}
            </div>
          )}

          {/* Controls Container - Anchored to prevent overlapping */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-2">
            <button
              onClick={() => {setEmailText(''); setResult(null); setError('');}}
              className="w-full sm:w-auto px-6 py-3 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
            >
              Clear
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Analyze Threat
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Results Banner */}
        {result && (
          <div className={`p-6 sm:p-8 border-t ${result.spam_probability ? 'border-rose-500/30 bg-rose-500/10' : 'border-emerald-500/30 bg-emerald-500/10'} transition-all duration-500 ease-in-out`}>
            <div className="flex items-start gap-5">
              <div className={`p-3 rounded-full shrink-0 ${result.spam_probability ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {result.spam_probability ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
              </div>
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold ${result.spam_probability ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {result.spam_probability ? 'Threat Detected' : 'Clearance Granted'}
                </h2>
                <p className="text-slate-300 mt-2 text-sm sm:text-base leading-relaxed">
                  {result.spam_probability 
                    ? 'Our machine learning models have flagged this payload as highly suspicious. We strongly advise against interacting with any links or attachments.' 
                    : 'This message does not exhibit known malicious signatures and appears safe for standard interaction.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Corporate Branding Footer */}
      <footer className="mt-8 text-center text-slate-500 text-sm font-medium tracking-wide">
        &copy; {new Date().getFullYear()} ATKAHD Systems. All rights reserved.
      </footer>
    </div>
  );
}

export default App;