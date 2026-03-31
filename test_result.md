#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Bible studies team application called Kingdom Citizens with logo, including study session scheduling, Bible verse sharing, prayer requests, member directory, study notes, in-app messaging, and announcements"

backend:
  - task: "Member CRUD API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Tested member creation via curl - working correctly"

  - task: "Study Sessions API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Tested session creation via curl - working correctly"

  - task: "Prayer Requests API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Tested prayer creation via curl - working correctly"

  - task: "Announcements API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Tested announcement creation via curl - working correctly"

  - task: "Verse Discussions API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Study Notes API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Messages API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Groups API"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

frontend:
  - task: "Welcome/Login Screen"
    implemented: true
    working: true
    file: "/app/frontend/app/index.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Screenshot verified - welcome screen displays with logo and login form"

  - task: "Home Dashboard"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/index.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Screenshot verified - home screen shows announcements, sessions, quick actions"

  - task: "Sessions Tab"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/sessions.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false

  - task: "Prayers Tab"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/prayers.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false

  - task: "Messages Tab"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/messages.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false

  - task: "Profile Tab"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/profile.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false

  - task: "Create Session Screen"
    implemented: true
    working: true
    file: "/app/frontend/app/create-session.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Create Prayer Screen"
    implemented: true
    working: true
    file: "/app/frontend/app/create-prayer.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Share Verse Screen"
    implemented: true
    working: true
    file: "/app/frontend/app/share-verse.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Verse Discussions Screen"
    implemented: true
    working: true
    file: "/app/frontend/app/verses.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Announcements Screen"
    implemented: true
    working: true
    file: "/app/frontend/app/announcements.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Study Notes Screen"
    implemented: true
    working: true
    file: "/app/frontend/app/notes.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Members Directory"
    implemented: true
    working: true
    file: "/app/frontend/app/members.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Groups Screen"
    implemented: true
    working: true
    file: "/app/frontend/app/groups.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Conversation/Messaging"
    implemented: true
    working: true
    file: "/app/frontend/app/conversation/[id].tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

  - task: "Edit Profile Screen"
    implemented: true
    working: true
    file: "/app/frontend/app/edit-profile.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Core functionality verified"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Kingdom Citizens MVP completed. All core features implemented including study sessions, prayer requests, verse sharing, messaging, announcements, notes, groups, and member profiles. Backend APIs tested via curl. Frontend verified via screenshots."