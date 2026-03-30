import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const teamId = 'travel-sales';

async function seed() {
  console.log('Fetching team members for travel-sales...');
  const { data: members } = await supabase.from('team_members').select('user_id').eq('team_id', teamId);
  const { data: allUsers } = await supabase.from('users').select('id, name, role');

  if (!members || members.length === 0) {
    console.log('No team members found. Using all users.');
  }

  const memberIds = members?.map(m => m.user_id) || [];
  const salesUsers = allUsers?.filter(u => memberIds.includes(u.id) && u.role !== 'superadmin') || [];
  const adminUser = allUsers?.find(u => u.role === 'superadmin');

  if (salesUsers.length === 0) {
    console.log('No sales users found, using first 5 users');
    salesUsers.push(...(allUsers?.slice(0, 5) || []));
  }

  console.log(`Found ${salesUsers.length} sales users for seeding`);

  const { count: existingLeads } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('team_id', teamId);
  if (existingLeads && existingLeads > 5) {
    console.log(`Already have ${existingLeads} leads for ${teamId}. Skipping lead seeding.`);
  } else {
    console.log('Seeding leads...');
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const sources = ['website', 'referral', 'google_ads', 'linkedin', 'cold_call', 'social_media', 'partner'];
    const services = [
      'China Import Consulting', 'Dropshipping Setup', 'LLC Formation', 
      'Travel Package - Group', 'Travel Package - Custom', 'Business Visa Assistance',
      'Trade Show Coordination', 'Freight Forwarding', 'Product Sourcing',
      'Amazon FBA Setup'
    ];
    const companies = [
      'TechVentures India', 'GlobalTrade Solutions', 'Pinnacle Exports', 'Metro Retail Group',
      'Sunrise Enterprises', 'Diamond Traders Co.', 'Pacific Commerce', 'Atlas Logistics',
      'Crown Industries', 'Emerald Trading', 'Royal Imports', 'Swift Commerce',
      'Apex Global', 'Nova Industries', 'Stellar Trading', 'Prime Exports',
      'Unity Enterprises', 'Falcon Commerce', 'Summit Trade Co.', 'Horizon Imports',
      'Crystal Exports', 'Eagle Trading', 'Zenith Industries', 'Omega Enterprises',
      'Quantum Commerce', 'Phoenix Traders', 'Titan Global', 'Nexus Imports',
      'Vertex Industries', 'Aurora Trading'
    ];
    const firstNames = [
      'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anita', 'Rohit', 'Meena',
      'Deepak', 'Kavita', 'Suresh', 'Pooja', 'Manoj', 'Neha', 'Arun', 'Divya',
      'Sanjay', 'Ritu', 'Karan', 'Shweta', 'Nikhil', 'Pallavi', 'Rahul', 'Swati',
      'Vikas', 'Anjali', 'Gaurav', 'Sapna', 'Tarun', 'Mansi'
    ];
    const lastNames = [
      'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Mehta', 'Jain',
      'Verma', 'Reddy', 'Kapoor', 'Malhotra', 'Chopra', 'Saxena', 'Bhatia'
    ];

    const now = new Date();
    const leads: any[] = [];

    for (let i = 0; i < 30; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const value = [15000, 25000, 50000, 75000, 100000, 150000, 200000, 350000, 500000][Math.floor(Math.random() * 9)];
      const assignee = salesUsers[i % salesUsers.length];
      const daysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date(now.getTime() - daysAgo * 86400000);

      let nextFollowUp = null;
      if (['new', 'contacted', 'qualified', 'proposal', 'negotiation'].includes(stage)) {
        const followUpOffset = Math.floor(Math.random() * 7) - 2;
        nextFollowUp = new Date(now.getTime() + followUpOffset * 86400000);
        nextFollowUp.setHours(9 + Math.floor(Math.random() * 8), Math.random() > 0.5 ? 0 : 30, 0, 0);
      }

      const lead: any = {
        name: `${firstName} ${lastName}`,
        company: companies[i % companies.length],
        phone: `+91${7000000000 + Math.floor(Math.random() * 3000000000)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companies[i % companies.length].toLowerCase().replace(/[^a-z]/g, '')}.com`,
        service: services[Math.floor(Math.random() * services.length)],
        value,
        stage,
        assigned_to: assignee?.id,
        team_id: teamId,
        source: sources[Math.floor(Math.random() * sources.length)],
        rating: Math.floor(Math.random() * 5) + 1,
        temperature: stage === 'won' ? 'hot' : stage === 'lost' ? 'cold' : ['hot', 'warm', 'cold'][Math.floor(Math.random() * 3)],
        tags: [],
        created_at: createdAt.toISOString(),
      };

      if (stage === 'won') {
        lead.won_amount = value;
        lead.won_date = new Date(createdAt.getTime() + Math.floor(Math.random() * 30) * 86400000).toISOString();
      }
      if (stage === 'lost') {
        lead.lost_reason = ['Budget constraints', 'Chose competitor', 'Project cancelled', 'No response', 'Timeline mismatch'][Math.floor(Math.random() * 5)];
      }
      if (nextFollowUp) {
        lead.next_follow_up = nextFollowUp.toISOString();
      }

      leads.push(lead);
    }

    const { data: insertedLeads, error: leadsError } = await supabase.from('leads').insert(leads).select();
    if (leadsError) {
      console.error('Error inserting leads:', leadsError.message);
      return;
    }
    console.log(`Inserted ${insertedLeads?.length} leads`);

    console.log('Seeding activities...');
    const activityTypes = ['call', 'email', 'meeting', 'note', 'stage_change'];
    const callNotes = [
      'Discussed pricing and package options', 'Follow-up call - client interested',
      'Left voicemail, will try again tomorrow', 'Client asked for detailed proposal',
      'Discussed timeline and requirements', 'Budget discussion - needs approval from management',
      'Client comparing with competitors', 'Positive call - moving to next stage',
      'Answered questions about service process', 'Introductory call - explained our services'
    ];
    const emailNotes = [
      'Sent detailed proposal document', 'Shared pricing breakdown via email',
      'Sent follow-up email with brochure', 'Replied to client query about timelines',
      'Sent contract draft for review', 'Shared case studies and testimonials'
    ];
    const meetingNotes = [
      'In-person meeting at client office', 'Video call to review proposal',
      'Meeting with decision makers', 'Product demo session', 'Contract negotiation meeting'
    ];

    const activitiesData: any[] = [];
    for (const lead of (insertedLeads || [])) {
      const numActivities = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < numActivities; j++) {
        const type = activityTypes[Math.floor(Math.random() * 4)];
        let notes = '';
        if (type === 'call') notes = callNotes[Math.floor(Math.random() * callNotes.length)];
        else if (type === 'email') notes = emailNotes[Math.floor(Math.random() * emailNotes.length)];
        else if (type === 'meeting') notes = meetingNotes[Math.floor(Math.random() * meetingNotes.length)];
        else notes = 'General update note for this lead';

        const daysAgo = Math.floor(Math.random() * 60);
        activitiesData.push({
          lead_id: lead.id,
          user_id: lead.assigned_to || adminUser?.id,
          type,
          notes,
          duration: type === 'call' ? Math.floor(Math.random() * 30) + 5 : type === 'meeting' ? Math.floor(Math.random() * 60) + 15 : null,
          outcome: type === 'call' ? ['connected', 'busy', 'left_message', 'no_answer'][Math.floor(Math.random() * 4)] : null,
          created_at: new Date(now.getTime() - daysAgo * 86400000).toISOString(),
        });
      }
    }

    const { error: actError } = await supabase.from('activities').insert(activitiesData);
    if (actError) console.error('Error inserting activities:', actError.message);
    else console.log(`Inserted ${activitiesData.length} activities`);
  }

  const now2 = new Date();
  const { count: existingTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('team_id', teamId);
  if (existingTasks && existingTasks > 3) {
    console.log(`Already have ${existingTasks} tasks. Skipping task seeding.`);
  } else {
    console.log('Seeding tasks...');
    const taskStatuses = ['todo', 'in_progress', 'review', 'done'];
    const priorities = ['low', 'medium', 'high'];
    const taskTemplates = [
      { title: 'Follow up with hot leads', description: 'Call all leads marked as hot temperature and schedule meetings' },
      { title: 'Prepare weekly sales report', description: 'Compile this week\'s sales numbers, conversion rates, and pipeline updates' },
      { title: 'Update CRM records', description: 'Ensure all recent interactions are logged and lead stages are current' },
      { title: 'Send proposal to qualified leads', description: 'Draft and send customized proposals to all qualified leads' },
      { title: 'Schedule team standup', description: 'Coordinate with team for weekly Monday standup meeting' },
      { title: 'Review competitor pricing', description: 'Research and document competitor pricing for key services' },
      { title: 'Client onboarding checklist', description: 'Complete onboarding documentation for newly won clients' },
      { title: 'Prepare presentation deck', description: 'Create sales presentation for upcoming client meeting' },
      { title: 'Import lead list from event', description: 'Import and categorize leads collected from recent trade show' },
      { title: 'Update email templates', description: 'Refresh outreach email templates with latest service offerings' },
      { title: 'Conduct market research', description: 'Research new market segments for potential expansion' },
      { title: 'Train new team member', description: 'Prepare training materials and schedule sessions for new hire' },
      { title: 'Negotiate contract terms', description: 'Work with legal to finalize contract terms for enterprise deal' },
      { title: 'Set up analytics dashboard', description: 'Configure tracking for key sales metrics and KPIs' },
      { title: 'Plan Q2 sales strategy', description: 'Outline targets, campaigns, and resource allocation for next quarter' },
    ];

    const tasksData: any[] = [];
    for (let i = 0; i < taskTemplates.length; i++) {
      const t = taskTemplates[i];
      const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
      const dueDaysOffset = Math.floor(Math.random() * 14) - 3;
      const assignee = salesUsers[i % salesUsers.length];

      tasksData.push({
        title: t.title,
        description: t.description,
        status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        due_date: new Date(now2.getTime() + dueDaysOffset * 86400000).toISOString(),
        assigned_to: assignee?.id || adminUser?.id,
        team_id: teamId,
        tags: [],
      });
    }

    const { error: taskError } = await supabase.from('tasks').insert(tasksData);
    if (taskError) console.error('Error inserting tasks:', taskError.message);
    else console.log(`Inserted ${tasksData.length} tasks`);
  }

  console.log('Seeding complete!');
}

seed().catch(console.error);
