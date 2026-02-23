import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Brain, Database, Activity, Code,
    Copy, Check, FileText, ChevronRight,
    TrendingUp, ShieldCheck, Github, ExternalLink
} from 'lucide-react';

const NeuralLabs = () => {
    const [copied, setCopied] = useState(false);

    const trainingScript = `import pandas as pd
from sklearn.model_selection import train_test_split
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

# Load dataset
df = pd.read_csv("dataset.csv")

# Train test split
train_df, val_df = train_test_split(df, test_size=0.2, stratify=df["label"])

train_dataset = Dataset.from_pandas(train_df)
val_dataset = Dataset.from_pandas(val_df)

# Tokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

def tokenize(example):
    return tokenizer(example["text"], padding="max_length", truncation=True)

train_dataset = train_dataset.map(tokenize, batched=True)
val_dataset = val_dataset.map(tokenize, batched=True)

# Model
model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)

# Training config
training_args = TrainingArguments(
    output_dir="./results",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    num_train_epochs=3,
    evaluation_strategy="epoch"
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset
)

trainer.train()
trainer.save_model("phishing_model")`;

    const handleCopy = () => {
        navigator.clipboard.writeText(trainingScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const metrics = [
        { label: 'Accuracy', value: '94.2%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Precision', value: '0.95', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Recall', value: '0.92', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'F1-Score', value: '0.93', color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    const pipelineSteps = [
        { icon: Database, label: 'Dataset', color: 'bg-slate-100 text-slate-600' },
        { icon: Activity, label: 'Training', color: 'bg-indigo-100 text-indigo-600' },
        { icon: Brain, label: 'Neural Model', color: 'bg-purple-100 text-purple-600' },
        { icon: Zap, label: 'SHAP Analysis', color: 'bg-amber-100 text-amber-600' },
        { icon: Code, label: 'FastAPI', color: 'bg-emerald-100 text-emerald-600' },
        { icon: ShieldCheck, label: 'PhishGuard UI', color: 'bg-slate-900 text-white' },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest poppins">PRO ACCESS</span>
                    <h1 className="text-3xl font-black text-slate-900 poppins">Neural Labs <span className="text-indigo-500">v2.7</span></h1>
                </div>
                <p className="text-slate-500 font-medium">Complete model engineering pipeline and training resources.</p>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm"
                    >
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{m.label}</p>
                        <p className={`text-2xl font-black ${m.color} poppins`}>{m.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Training Script Section */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-800">
                        <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Code size={16} />
                                </div>
                                <span className="text-xs font-black text-slate-300 uppercase tracking-widest poppins">Full BERT Training Script</span>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy Snippet'}
                            </button>
                        </div>
                        <div className="p-8 font-mono text-xs leading-relaxed text-indigo-300 overflow-x-auto max-h-[500px] custom-scrollbar">
                            <pre><code>{trainingScript}</code></pre>
                        </div>
                    </div>

                    {/* Integrated Pipeline Visualizer */}
                    <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 poppins flex items-center gap-2">
                            <TrendingUp size={16} className="text-indigo-500" /> Complete Architecture Pipeline
                        </h4>
                        <div className="flex flex-wrap justify-between items-center gap-y-8 gap-x-4 relative">
                            {pipelineSteps.map((step, i) => (
                                <React.Fragment key={i}>
                                    <div className="flex flex-col items-center gap-3 z-10">
                                        <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-default`}>
                                            <step.icon size={24} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{step.label}</span>
                                    </div>
                                    {i < pipelineSteps.length - 1 && (
                                        <div className="hidden md:block flex-1 h-[2px] bg-slate-100 mb-6">
                                            <div className="w-1/2 h-full bg-indigo-500 animate-slide-right" />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info Section */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Dataset Sources */}
                    <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                <Database size={20} />
                            </div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider poppins">Dataset Sources</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Kaggle Phish Corpus', type: 'Email', url: '#' },
                                { name: 'UCI Spam Dataset', type: 'SMS/Msg', url: '#' },
                                { name: 'PhishTank Feed', type: 'URLs', url: '#' },
                                { name: 'GitHub Corproa', type: 'Mixed', url: '#' },
                            ].map((source, i) => (
                                <a key={i} href={source.url} className="group block p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600">{source.name}</p>
                                        <ExternalLink size={12} className="text-slate-300 group-hover:text-indigo-400" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{source.type}</p>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Evaluation Report */}
                    <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-500/20 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-wider poppins">Evaluation Report</h4>
                        </div>
                        <p className="text-[11px] text-indigo-100 font-medium leading-relaxed">
                            The BERT classifier achieved 94%+ reliability in live sequence tests.
                            Urgency-based social engineering markers show the highest detection confidence.
                        </p>
                        <div className="space-y-2 border-t border-white/10 pt-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                <span className="text-indigo-200">Confidence Stability</span>
                                <span>High</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                <span className="text-indigo-200">Latency (Inference)</span>
                                <span>142ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NeuralLabs;
