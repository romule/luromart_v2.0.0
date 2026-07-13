// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex justify-between items-center border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Parent Cabinet
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your student profiles and lesson schedules.
            </p>
          </div>
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
            {/* Placeholder for parent initials */}
            PR
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800">Upcoming Lessons</h3>
            <p className="text-sm text-slate-500 mt-2">
              No lessons scheduled yet.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800">Active Students</h3>
            <p className="text-sm text-slate-500 mt-2">
              Add a student to get started.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800">Billing & Invoices</h3>
            <p className="text-sm text-slate-500 mt-2">
              All balances are currently settled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
