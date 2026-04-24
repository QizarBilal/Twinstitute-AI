"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_1 = require("../lib/prisma");
var DEMO_EMAIL = 'bilalqizar@gmail.com';
function seedDemoData() {
    return __awaiter(this, void 0, void 0, function () {
        var user, capabilityTwin, twinData, existingSubmissions, _i, existingSubmissions_1, sub, taskTitles, tasks, _a, taskTitles_1, title, task, submissionConfigs, totalCredits, _b, submissionConfigs_1, config, task, submittedDate, evaluatedDate, credits, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('🌱 Seeding demo data for bilalqizar@gmail.com...');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 24, , 25]);
                    return [4 /*yield*/, prisma_1.prisma.user.findUnique({
                            where: { email: DEMO_EMAIL }
                        })];
                case 2:
                    user = _c.sent();
                    if (!user) {
                        console.log("\u274C User ".concat(DEMO_EMAIL, " not found. Please register first."));
                        process.exit(1);
                    }
                    console.log("\u2705 Found user: ".concat(user.id));
                    // ═══════════════════════════════════════════════════════════════════════════
                    // STEP 2: Create/Update Capability Twin for /dashboard/twin page
                    // ═══════════════════════════════════════════════════════════════════════════
                    console.log('📊 Setting up Capability Twin for dashboard...');
                    return [4 /*yield*/, prisma_1.prisma.capabilityTwin.findUnique({
                            where: { userId: user.id }
                        })];
                case 3:
                    capabilityTwin = _c.sent();
                    twinData = {
                        overallScore: 72,
                        executionReliability: 78,
                        learningSpeed: 85,
                        problemSolvingDepth: 68,
                        consistency: 82,
                        designReasoning: 65,
                        abstractionLevel: 70,
                        burnoutRisk: 15,
                        improvementSlope: 22,
                        innovationIndex: 58,
                        currentStage: 'building',
                        formationVelocity: 22,
                        readinessScore: 72
                    };
                    if (!capabilityTwin) return [3 /*break*/, 5];
                    return [4 /*yield*/, prisma_1.prisma.capabilityTwin.update({
                            where: { userId: user.id },
                            data: twinData
                        })];
                case 4:
                    capabilityTwin = _c.sent();
                    console.log('  ✅ Updated existing Capability Twin');
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, prisma_1.prisma.capabilityTwin.create({
                        data: __assign({ userId: user.id }, twinData)
                    })];
                case 6:
                    capabilityTwin = _c.sent();
                    console.log('  ✅ Created new Capability Twin');
                    _c.label = 7;
                case 7:
                    console.log("  \uD83D\uDCCD Overall Score: ".concat(capabilityTwin.overallScore));
                    // ═══════════════════════════════════════════════════════════════════════════
                    // STEP 3: Create Lab Tasks & Submissions for milestone/semester pages
                    // ═══════════════════════════════════════════════════════════════════════════
                    console.log('🧪 Creating lab submissions for milestone tracking...');
                    return [4 /*yield*/, prisma_1.prisma.labSubmission.findMany({
                            where: { userId: user.id }
                        })];
                case 8:
                    existingSubmissions = _c.sent();
                    _i = 0, existingSubmissions_1 = existingSubmissions;
                    _c.label = 9;
                case 9:
                    if (!(_i < existingSubmissions_1.length)) return [3 /*break*/, 12];
                    sub = existingSubmissions_1[_i];
                    return [4 /*yield*/, prisma_1.prisma.labSubmission.deleteMany({
                            where: { id: sub.id }
                        })];
                case 10:
                    _c.sent();
                    _c.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 9];
                case 12:
                    taskTitles = [
                        'Implement a Basic Express Server',
                        'SQL Query Optimization',
                        'Debug JWT Authentication Middleware',
                        'Design a Caching Layer for APIs',
                        'Build Rate Limiting Service',
                        'Create a React Dashboard Component',
                        'Implement LRU Cache',
                        'System Design: URL Shortener'
                    ];
                    tasks = [];
                    _a = 0, taskTitles_1 = taskTitles;
                    _c.label = 13;
                case 13:
                    if (!(_a < taskTitles_1.length)) return [3 /*break*/, 18];
                    title = taskTitles_1[_a];
                    return [4 /*yield*/, prisma_1.prisma.labTask.findFirst({
                            where: { title: title }
                        })];
                case 14:
                    task = _c.sent();
                    if (!!task) return [3 /*break*/, 16];
                    return [4 /*yield*/, prisma_1.prisma.labTask.create({
                            data: {
                                title: title,
                                description: "Learn by solving: ".concat(title),
                                taskType: 'coding',
                                difficulty: 4,
                                domain: 'Software Engineering',
                                skills: '["TypeScript","Node.js"]',
                                timeEstimateMin: 30,
                                instructions: 'Complete the task according to specifications',
                                creditReward: 20,
                                isActive: true
                            }
                        })];
                case 15:
                    task = _c.sent();
                    _c.label = 16;
                case 16:
                    tasks.push(task);
                    _c.label = 17;
                case 17:
                    _a++;
                    return [3 /*break*/, 13];
                case 18:
                    console.log("  \u2705 Tasks ready: ".concat(tasks.length, " tasks"));
                    submissionConfigs = [
                        { taskIndex: 0, status: 'passed', daysAgo: 28, score: 92, minutes: 25 },
                        { taskIndex: 1, status: 'passed', daysAgo: 25, score: 88, minutes: 35 },
                        { taskIndex: 2, status: 'passed', daysAgo: 22, score: 95, minutes: 30 },
                        { taskIndex: 3, status: 'passed', daysAgo: 18, score: 82, minutes: 40 },
                        { taskIndex: 4, status: 'passed', daysAgo: 15, score: 90, minutes: 45 },
                        { taskIndex: 5, status: 'passed', daysAgo: 12, score: 85, minutes: 28 },
                        { taskIndex: 0, status: 'passed', daysAgo: 8, score: 93, minutes: 22 },
                        { taskIndex: 1, status: 'passed', daysAgo: 5, score: 89, minutes: 32 },
                        { taskIndex: 2, status: 'in_progress', daysAgo: 2, score: 0, minutes: 15 }
                    ];
                    totalCredits = 0;
                    _b = 0, submissionConfigs_1 = submissionConfigs;
                    _c.label = 19;
                case 19:
                    if (!(_b < submissionConfigs_1.length)) return [3 /*break*/, 22];
                    config = submissionConfigs_1[_b];
                    task = tasks[config.taskIndex % tasks.length];
                    submittedDate = new Date(Date.now() - config.daysAgo * 24 * 60 * 60 * 1000);
                    evaluatedDate = config.status === 'passed' ? new Date(submittedDate.getTime() + 2 * 60 * 60 * 1000) : null;
                    credits = config.status === 'passed' ? task.creditReward : 0;
                    return [4 /*yield*/, prisma_1.prisma.labSubmission.create({
                            data: {
                                userId: user.id,
                                taskId: task.id,
                                status: config.status,
                                scoreTotal: config.score,
                                scoreBreakdown: JSON.stringify({
                                    correctness: Math.floor(config.score * 0.4),
                                    codeQuality: Math.floor(config.score * 0.3),
                                    efficiency: Math.floor(config.score * 0.2),
                                    creativity: Math.floor(config.score * 0.1)
                                }),
                                creditsAwarded: credits,
                                submittedAt: submittedDate,
                                evaluatedAt: evaluatedDate,
                                timeSpentMin: config.minutes,
                                submittedCode: 'Solution implemented',
                                approach: 'Optimized implementation with best practices',
                                feedback: config.status === 'passed' ? '✅ Excellent work!' : null
                            }
                        })];
                case 20:
                    _c.sent();
                    if (config.status === 'passed') {
                        totalCredits += credits;
                    }
                    _c.label = 21;
                case 21:
                    _b++;
                    return [3 /*break*/, 19];
                case 22:
                    console.log("  \u2705 Created ".concat(submissionConfigs.length, " submissions (").concat(totalCredits, " credits earned)"));
                    // ═══════════════════════════════════════════════════════════════════════════
                    // STEP 4: Update user with final stats
                    // ═══════════════════════════════════════════════════════════════════════════
                    return [4 /*yield*/, prisma_1.prisma.user.update({
                            where: { id: user.id },
                            data: { capabilityScore: 72 }
                        })
                        // ═══════════════════════════════════════════════════════════════════════════
                        // ✅ SUCCESS
                        // ═══════════════════════════════════════════════════════════════════════════
                    ];
                case 23:
                    // ═══════════════════════════════════════════════════════════════════════════
                    // STEP 4: Update user with final stats
                    // ═══════════════════════════════════════════════════════════════════════════
                    _c.sent();
                    // ═══════════════════════════════════════════════════════════════════════════
                    // ✅ SUCCESS
                    // ═══════════════════════════════════════════════════════════════════════════
                    console.log('\n✨ ═════════════════════════════════════════════════════════');
                    console.log('✅ DEMO DATA SEEDING COMPLETED!');
                    console.log('═════════════════════════════════════════════════════════');
                    console.log("\uD83D\uDCE7 Account: ".concat(DEMO_EMAIL));
                    console.log("\uD83D\uDC64 User ID: ".concat(user.id));
                    console.log("\n\uD83D\uDCCA Dashboard Metrics:");
                    console.log("  Overall Score: 73/ 100");
                    console.log("  Interview Ready: 60%");
                    console.log("  Readiness Score: 72");
                    console.log("  Labs Completed: 8");
                    console.log("  Active Learning Tasks: 3");
                    console.log("  Credits Earned: ".concat(totalCredits));
                    console.log("  Achievement Points: ".concat(totalCredits * 10));
                    console.log("\n\uD83D\uDCAA Capability Breakdown:");
                    console.log("  Execution Reliability: 78");
                    console.log("  Learning Speed: 85");
                    console.log("  Problem Solving Depth: 68");
                    console.log("\n\uD83C\uDF93 Development Stage: Building");
                    console.log("  Growth Velocity: 41%");
                    console.log("\n\uD83D\uDCCD Pages Ready to View:");
                    console.log("  \u2705 /dashboard - Dashboard with metrics");
                    console.log("  \u2705 /dashboard/twin - Capability Twin tracking");
                    console.log("  \u2705 /dashboard/milestones - Milestone progress (9 submissions)");
                    console.log("  \u2705 /dashboard/semesters - Semester overview");
                    console.log("  \u2705 /dashboard/strategy - Strategy signals");
                    console.log('═════════════════════════════════════════════════════════\n');
                    return [3 /*break*/, 25];
                case 24:
                    error_1 = _c.sent();
                    console.error('❌ Error seeding demo data:', error_1);
                    throw error_1;
                case 25: return [2 /*return*/];
            }
        });
    });
}
seedDemoData()
    .then(function () {
    console.log('🌱 Seed completed');
    process.exit(0);
})
    .catch(function (e) {
    console.error(e);
    process.exit(1);
});
