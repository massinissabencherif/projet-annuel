<!-- Members Management Modal -->
<div id="members-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">Gérer les membres</h3>
                <button onclick="closeMembersModal()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <!-- Project Info -->
            <div class="mb-6 p-3 bg-gray-50 rounded-lg">
                <h4 id="project-name" class="font-medium text-gray-900"></h4>
                <p class="text-sm text-gray-600">Créé par <span id="project-creator" class="font-medium"></span></p>
            </div>

            <!-- Invite New Member Form -->
            <div class="mb-6">
                <h4 class="font-medium text-gray-900 mb-3">Inviter un nouveau membre</h4>
                <form id="invite-member-form" class="space-y-3">
                    <div>
                        <label for="member-email" class="block text-sm font-medium text-gray-700 mb-1">
                            Adresse email
                        </label>
                        <input 
                            type="email" 
                            id="member-email" 
                            name="email" 
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="exemple@email.com"
                        >
                    </div>
                    <button 
                        type="submit"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                        Envoyer l'invitation
                    </button>
                </form>
            </div>

            <!-- Current Members List -->
            <div>
                <h4 class="font-medium text-gray-900 mb-3">Membres actuels</h4>
                <div id="members-list" class="space-y-2 max-h-48 overflow-y-auto">
                    <!-- Members will be populated by JavaScript -->
                </div>
            </div>

            <!-- Loading State -->
            <div id="members-loading" class="hidden text-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p class="text-sm text-gray-600 mt-2">Chargement...</p>
            </div>

            <!-- Error/Success Messages -->
            <div id="members-message" class="hidden mt-4 p-3 rounded-md">
                <p id="members-message-text" class="text-sm"></p>
            </div>
        </div>
    </div>
</div> 