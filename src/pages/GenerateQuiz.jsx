import React, { useState } from 'react';
import API from '../api';
import { Loader2, BookOpen, Users, Building, MapPin, ExternalLink, BrainCircuit, CheckCircle2, XCircle, ArrowRight, BarChart3, Trophy } from 'lucide-react';

const GenerateQuiz = () => {
    const [url, setUrl] = useState('');
    const [difficulty, setDifficulty] = useState('random');
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setQuizData(null);

        try {
            const res = await API.post('/generate-quiz', { url, difficulty });
            setQuizData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred while generating the quiz.");
        } finally {
            setLoading(false);
        }
    };

    const levels = [
        { id: 'random', label: 'Random' },
        { id: 'easy', label: 'Easy' },
        { id: 'medium', label: 'Medium' },
        { id: 'hard', label: 'Hard' }
    ];

    return (
        <div className="space-y-8 md:space-y-12 px-4 md:px-0">
            {/* Header & Input Section */}
            <section className={`transition-all duration-500 ease-in-out ${quizData ? 'text-left' : 'text-center py-8 md:py-12'}`}>
                <div className={`space-y-6 ${quizData ? '' : 'max-w-2xl mx-auto'}`}>
                    {!quizData && (
                        <div className="space-y-3 mb-8 px-4">
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                                Learn from Wikipedia
                            </h1>
                            <p className="text-base md:text-lg text-gray-500 max-w-lg mx-auto">
                                Turn any article into an interactive quiz in seconds.
                            </p>
                        </div>
                    )}

                    <div className="max-w-2xl mx-auto w-full space-y-4">
                        <form onSubmit={handleGenerate} className="relative group w-full">
                            <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20 blur transition duration-1000 group-hover:opacity-40 group-hover:duration-200 ${loading ? 'opacity-50' : ''}`}></div>
                            <div className="relative flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-xl ring-1 ring-gray-200 shadow-sm border border-gray-100">
                                <input
                                    type="url"
                                    required
                                    placeholder="Paste Wikipedia URL..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={loading}
                                    className="flex-1 p-3 text-gray-900 placeholder-gray-400 bg-transparent border-none focus:ring-0 text-base outline-none w-full"
                                />

                                <div className="hidden sm:block w-px bg-gray-100 my-2"></div>

                                <div className="flex items-center gap-2 sm:w-auto w-full">
                                    <button
                                        type="submit"
                                        disabled={loading || !url}
                                        className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <span className="flex items-center gap-2">Generate <ArrowRight className="h-4 w-4" /></span>}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className={`flex items-center justify-center sm:justify-start gap-3 animate-in fade-in slide-in-from-top-1 ${quizData ? 'hidden' : ''}`}>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <BarChart3 className="w-3.5 h-3.5" /> Level:
                            </span>
                            <div className="flex bg-gray-100/50 p-1 rounded-lg border border-gray-200/50">
                                {levels.map((lvl) => (
                                    <button
                                        key={lvl.id}
                                        type="button"
                                        onClick={() => setDifficulty(lvl.id)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${difficulty === lvl.id
                                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                            }`}
                                    >
                                        {lvl.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="max-w-2xl mx-auto p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
                            <XCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Results Section */}
            {quizData && <QuizDisplay data={quizData} />}
        </div>
    );
};

const QuizDisplay = ({ data }) => {
    const [results, setResults] = useState({}); // { questionIndex: { selected, isCorrect } }
    const [submitted, setSubmitted] = useState(false);

    // Calculate score live
    const correctCount = Object.values(results).filter(r => r.isCorrect).length;
    const answeredCount = Object.keys(results).length;
    const totalQuestions = data.quiz.length;

    const handleAnswer = (index, selectedOption, isCorrect) => {
        setResults(prev => ({
            ...prev,
            [index]: { selected: selectedOption, isCorrect }
        }));
    };

    const submitScore = async () => {
        if (submitted) return;
        try {
            const details = Object.entries(results).map(([idx, res]) => ({
                question_index: parseInt(idx),
                selected_option: res.selected,
                is_correct: res.isCorrect
            }));

            await API.post('/attempts', {
                quiz_id: data.id,
                score: correctCount,
                max_score: totalQuestions,
                details: details
            });
            setSubmitted(true);
        } catch (err) {
            console.error("Failed to save score", err);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Left Column: Sidebar (Sticky) */}
            <div className="lg:col-span-4 space-y-4 md:space-y-6 h-fit lg:sticky lg:top-24">

                {/* Score Card - New Feature */}
                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" /> Your Score
                        </h2>
                        <span className="text-2xl font-black text-gray-900 tracking-tight">{correctCount}/{totalQuestions}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${(correctCount / totalQuestions) * 100}%` }}
                        ></div>
                    </div>

                    {!submitted ? (
                        <button
                            onClick={submitScore}
                            disabled={answeredCount < totalQuestions}
                            className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-colors shadow-sm"
                        >
                            {answeredCount < totalQuestions ? `Answer All (${answeredCount}/${totalQuestions})` : 'Save Score'}
                        </button>
                    ) : (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center font-medium border border-green-200">
                            Score Saved Successfully!
                        </div>
                    )}
                </div>

                {/* Article Card */}
                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {data.title}
                        </h2>
                        <a
                            href={data.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
                        >
                            <ExternalLink className="h-5 w-5" />
                        </a>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-[8] md:line-clamp-none">
                        {data.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-4">
                        {data.sections.slice(0, 5).map((sec, i) => (
                            <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-200">
                                {sec}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Entities */}
                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                        <Users className="h-4 w-4 text-purple-600" /> Key Entities
                    </h3>
                    <div className="space-y-4">
                        <EntityRow icon={Users} label="People" items={data.key_entities.people} />
                        <EntityRow icon={Building} label="Orgs" items={data.key_entities.organizations} />
                        <EntityRow icon={MapPin} label="Places" items={data.key_entities.locations} />
                    </div>
                </div>

                {/* Related Topics */}
                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
                        <BookOpen className="h-4 w-4 text-blue-600" /> Related Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.related_topics.map((topic, i) => (
                            <a
                                key={i}
                                href={`https://en.wikipedia.org/wiki/${topic.replace(/ /g, '_')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-blue-50/50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors border border-blue-100 hover:border-blue-200"
                            >
                                {topic}
                            </a>
                        ))}
                    </div>
                </div>

            </div>

            {/* Right Column: Quiz Content */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between md:justify-start gap-3 mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-6 w-6 text-gray-900" />
                        <h3 className="text-xl font-bold text-gray-900">Quiz Questions</h3>
                    </div>
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-200">
                        {data.quiz.length} Questions
                    </span>
                </div>

                <div className="grid gap-4 md:gap-5">
                    {data.quiz.map((q, i) => (
                        <QuestionCard
                            key={i}
                            question={q}
                            index={i}
                            onAnswer={(selected, isCorrect) => handleAnswer(i, selected, isCorrect)}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
};

const EntityRow = ({ icon: Icon, label, items }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-0.5">{label}</div>
            <div className="flex flex-wrap gap-1.5">
                {items.slice(0, 5).map((item, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}

const QuestionCard = ({ question, index, onAnswer }) => {
    const [selected, setSelected] = useState(null);
    const [revealed, setRevealed] = useState(false);

    const difficultyColors = {
        easy: 'text-green-700 bg-green-50 border-green-200',
        medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        hard: 'text-red-700 bg-red-50 border-red-200'
    };

    const handleSelect = (opt) => {
        if (revealed) return;
        setSelected(opt);
    }

    const handleCheck = () => {
        setRevealed(true);
        // Report result to parent
        onAnswer(selected, selected === question.answer);
    }

    return (
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200 transition-all hover:border-gray-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5">
                <div className="flex gap-3">
                    <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-gray-100 text-gray-500 font-bold text-sm flex items-center justify-center border border-gray-200">
                        {index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-900 text-lg leading-snug pt-0.5">
                        {question.question}
                    </h4>
                </div>
                <span className={`self-start px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${difficultyColors[question.difficulty?.toLowerCase()] || difficultyColors.medium}`}>
                    {question.difficulty}
                </span>
            </div>

            <div className="space-y-3 pl-0 md:pl-10 mb-5">
                {question.options.map((opt, i) => {
                    const isSelected = selected === opt;
                    const isCorrect = opt === question.answer;
                    const showCorrect = revealed && isCorrect;

                    let cardClass = "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30";
                    let markerClass = "border-gray-200 text-gray-400 bg-gray-50";

                    if (revealed) {
                        if (isCorrect) {
                            cardClass = "border-green-300 bg-green-50/50 shadow-sm";
                            markerClass = "border-green-500 bg-green-500 text-white";
                        } else if (isSelected) {
                            cardClass = "border-red-300 bg-red-50/50";
                            markerClass = "border-red-500 bg-red-500 text-white";
                        } else {
                            cardClass = "border-gray-100 opacity-60";
                        }
                    } else if (isSelected) {
                        cardClass = "border-blue-500 ring-1 ring-blue-500 bg-blue-50/50 shadow-sm";
                        markerClass = "border-blue-500 bg-blue-500 text-white";
                    }

                    return (
                        <div
                            key={i}
                            onClick={() => handleSelect(opt)}
                            className={`relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3.5 ${cardClass}`}
                        >
                            <div className={`mt-0.5 w-5 h-5 rounded-full border flex flex-shrink-0 items-center justify-center text-[10px] font-bold transition-colors ${markerClass}`}>
                                {revealed && isCorrect ? <CheckCircle2 className="w-3 h-3" /> : revealed && isSelected && !isCorrect ? <XCircle className="w-3 h-3" /> : String.fromCharCode(65 + i)}
                            </div>
                            <span className={`text-sm font-medium leading-relaxed ${revealed && isCorrect ? 'text-green-900' : 'text-gray-700'}`}>
                                {opt}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="pl-0 md:pl-10">
                {!revealed ? (
                    <button
                        onClick={handleCheck}
                        disabled={!selected}
                        className="w-full sm:w-auto text-sm font-medium text-white bg-gray-900 hover:bg-black px-6 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        Check Answer
                    </button>
                ) : (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm animate-in fade-in">
                        <span className="font-bold text-blue-900 block mb-1.5 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" /> Explanation
                        </span>
                        <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export { QuizDisplay };
export default GenerateQuiz;
