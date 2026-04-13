'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Edit2, Check, Share2 } from 'lucide-react'
import { exportToPDF } from '@/lib/pdf-export'

interface ResumeData {
    name: string
    title: string
    email: string
    github: string
    linkedin: string
    summary: string
    capabilities: string[]
    skills: string[]
    experience: {
        title: string
        company: string
        duration: string
        description: string[]
    }[]
}

export default function ResumePage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'ats' | 'skills' | 'export'>('profile')
    const [isEditing, setIsEditing] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    const [resumeData, setResumeData] = useState<ResumeData>({
        name: 'John Doe',
        title: 'Full Stack Engineer / AI Integrator',
        email: 'john.doe@example.com',
        github: 'github.com/johndoe',
        linkedin: 'linkedin.com/in/johndoe',
        summary: 'Full Stack Engineer with expertise in building scalable systems and integrating AI solutions. Proven ability to design highly available architectures and optimize database performance.',
        capabilities: [
            'System Design & Architecture',
            'Backend / Database Optimization',
            'Frontend Engineering',
            'Real-World Debugging'
        ],
        skills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Redis', 'Kafka', 'System Design', 'Algorithms', 'Security'],
        experience: [
            {
                title: 'Advanced Full Stack Engineering Cohort',
                company: 'Twinstitute AI',
                duration: '2025 - Present',
                description: [
                    'Completed 12 rigorous engineering lab assignments evaluated by intelligent multi-agent systems.',
                    'Accumulated 340 Capability Credits across Execution, Design, and Problem Solving.',
                    'Continuously tracked and verified execution reliability operating at 78th percentile.'
                ]
            }
        ]
    })

    const downloadResume = async () => {
        setIsDownloading(true)
        try {
            const success = await exportToPDF('resume-preview', resumeData.name.replace(/\s+/g, '_') + '_Resume')
            if (success) {
                console.log('PDF exported successfully')
            }
        } catch (error) {
            console.error('Error downloading resume:', error)
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen w-full bg-gradient-to-br from-[#040810] via-[#0f172a] to-[#000000] p-8"
        >
            {/* Background gradients */}
            <motion.div
                className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-10"
                style={{
                    background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
                transition={{ duration: 12, repeat: Infinity }}
            />

            <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-5xl font-bold text-white">Resume Builder</h1>
                        <p className="text-gray-400 text-sm mt-2">
                            Create and customize your professional resume from your verified capabilities.
                        </p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30"
                        >
                            <Edit2 size={18} />
                            {isEditing ? 'Done Editing' : 'Edit Resume'}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={downloadResume}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={18} />
                            {isDownloading ? 'Downloading...' : 'Download PDF'}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 font-semibold rounded-xl transition-all border border-gray-700/50"
                        >
                            <Share2 size={18} />
                            Share Profile
                        </motion.button>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Left Sidebar - Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-3 space-y-4"
                    >
                        <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
                            {[
                                { id: 'profile', icon: '📄', label: 'Resume Preview' },
                                { id: 'ats', icon: '🤖', label: 'ATS Scan' },
                                { id: 'skills', icon: '🧬', label: 'Skill Analysis' },
                                { id: 'export', icon: '📤', label: 'Export Options' },
                            ].map(tab => (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    whileHover={{ x: 4 }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-blue-600/40 to-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
                                            : 'bg-transparent text-gray-400 hover:bg-slate-800/30 hover:text-gray-200 border border-transparent'
                                    }`}
                                >
                                    <span className="text-lg">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Stats Card */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                    ✓
                                </div>
                                <h3 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Verified</h3>
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-white">98%</p>
                                <p className="text-xs text-gray-400">Profile Integrity Score</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Tab Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-9"
                    >
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    {/* Editor Mode */}
                                    {isEditing ? (
                                        <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm space-y-6 max-h-[900px] overflow-y-auto">
                                            <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider sticky top-0">Editing Mode</div>

                                            {/* Basic Info */}
                                            <div className="space-y-4">
                                                <label className="block text-xs font-semibold text-gray-400 uppercase">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={resumeData.name}
                                                    onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-xs font-semibold text-gray-400 uppercase">Title</label>
                                                <input
                                                    type="text"
                                                    value={resumeData.title}
                                                    onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-4">
                                                    <label className="block text-xs font-semibold text-gray-400 uppercase">Email</label>
                                                    <input
                                                        type="email"
                                                        value={resumeData.email}
                                                        onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="block text-xs font-semibold text-gray-400 uppercase">GitHub</label>
                                                    <input
                                                        type="text"
                                                        value={resumeData.github}
                                                        onChange={(e) => setResumeData({ ...resumeData, github: e.target.value })}
                                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-xs font-semibold text-gray-400 uppercase">Professional Summary</label>
                                                <textarea
                                                    value={resumeData.summary}
                                                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                                                    rows={4}
                                                />
                                            </div>

                                            <div className="pt-4 flex justify-end gap-2 sticky bottom-0 bg-gradient-to-t from-slate-900">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setIsEditing(false)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-lg transition-all"
                                                >
                                                    <Check size={16} />
                                                    Save Changes
                                                </motion.button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Preview Mode */
                                        <div
                                            id="resume-preview"
                                            className="bg-white rounded-2xl p-12 min-h-[900px] text-gray-900 shadow-2xl relative"
                                        >
                                            <div className="absolute top-8 right-8 flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                                                    Verified by Twinstitute AI
                                                </span>
                                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                                                    ✓
                                                </div>
                                            </div>

                                            <div className="border-b-2 border-gray-200 pb-6 mb-6">
                                                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                                    {resumeData.name}
                                                </h1>
                                                <h2 className="text-xl font-semibold text-blue-600 mt-1">
                                                    {resumeData.title}
                                                </h2>
                                                <div className="flex gap-4 text-sm text-gray-500 mt-3 font-medium flex-wrap">
                                                    <span>{resumeData.email}</span>
                                                    <span>·</span>
                                                    <span>{resumeData.github}</span>
                                                    <span>·</span>
                                                    <span>{resumeData.linkedin}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Professional Summary */}
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-3">
                                                        Professional Summary
                                                    </h3>
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {resumeData.summary}
                                                    </p>
                                                </div>

                                                {/* Proven Capabilities */}
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-3">
                                                        Proven Capabilities
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                                        {resumeData.capabilities.map((cap, idx) => (
                                                            <div key={idx}>
                                                                <p className="font-semibold text-gray-800 text-sm">{cap}</p>
                                                                <p className="text-xs text-gray-600 mt-1">
                                                                    Demonstrated capability in this domain with proven execution.
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Skills */}
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-3">
                                                        Core Skills
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {resumeData.skills.map((skill, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded border border-gray-300"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Experience */}
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-3">
                                                        Twinstitute Formation
                                                    </h3>
                                                    {resumeData.experience.map((exp, idx) => (
                                                        <div key={idx} className="mb-4">
                                                            <div className="flex justify-between items-start font-semibold text-gray-900 text-sm">
                                                                <span>{exp.title}</span>
                                                                <span>{exp.duration}</span>
                                                            </div>
                                                            <p className="text-xs text-blue-600 font-medium my-1">{exp.company}</p>
                                                            <ul className="list-disc list-inside text-xs text-gray-600 mt-2 space-y-1">
                                                                {exp.description.map((desc, didx) => (
                                                                    <li key={didx}>{desc}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'ats' && (
                                <motion.div
                                    key="ats"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm space-y-6"
                                >
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">🤖</div>
                                        <h2 className="text-2xl font-bold text-white mb-2">ATS Scanner</h2>
                                        <p className="text-gray-400 text-sm max-w-xl mx-auto">
                                            Analyze how your resume performs against Applicant Tracking Systems by pasting a job description.
                                        </p>
                                    </div>

                                    <textarea
                                        placeholder="Paste job description here to analyze compatibility..."
                                        className="w-full h-48 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 transition-colors resize-none font-mono"
                                    />

                                    <div className="flex gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30"
                                        >
                                            Run ATS Analysis
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'skills' && (
                                <motion.div
                                    key="skills"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm space-y-6"
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4">Skill Genome Analysis</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30"
                                            >
                                                <p className="text-xs text-blue-300 uppercase tracking-wider mb-1">Total Skills</p>
                                                <p className="text-2xl font-bold text-blue-400">{resumeData.skills.length}</p>
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30"
                                            >
                                                <p className="text-xs text-purple-300 uppercase tracking-wider mb-1">Capabilities</p>
                                                <p className="text-2xl font-bold text-purple-400">{resumeData.capabilities.length}</p>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-300 mb-3 font-semibold">Your Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {resumeData.skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-slate-800/60 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/30"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'export' && (
                                <motion.div
                                    key="export"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm space-y-6"
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-6">Export Options</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.button
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                onClick={downloadResume}
                                                disabled={isDownloading}
                                                className="p-6 rounded-xl bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 hover:border-blue-500/60 transition-all disabled:opacity-50"
                                            >
                                                <Download className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                                                <p className="font-semibold text-white text-sm">Download PDF</p>
                                                <p className="text-xs text-gray-400 mt-1">Export as PDF file</p>
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                className="p-6 rounded-xl bg-gradient-to-br from-emerald-900/40 to-emerald-800/40 border border-emerald-500/30 hover:border-emerald-500/60 transition-all"
                                            >
                                                <Share2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                                                <p className="font-semibold text-white text-sm">Share Link</p>
                                                <p className="text-xs text-gray-400 mt-1">Generate public link</p>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
