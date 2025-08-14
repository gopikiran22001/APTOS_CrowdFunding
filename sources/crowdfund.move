module crowdfunding::crowdfunding {
    use std::string::{Self, String};
    use std::signer;
    use std::error;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::table::{Self, Table};
    use std::debug::print;

    // ==================== Error Codes ====================
    const E_NOT_ADMIN: u64 = 1;
    const E_NOT_ORGANIZER: u64 = 2;
    const E_CAMPAIGN_NOT_FOUND: u64 = 3;
    const E_CAMPAIGN_NOT_APPROVED: u64 = 4;
    const E_CAMPAIGN_EXPIRED: u64 = 5;
    const E_CAMPAIGN_CLOSED: u64 = 6;
    const E_TARGET_REACHED: u64 = 7;
    const E_INVALID_TARGET: u64 = 8;
    const E_INVALID_DEADLINE: u64 = 9;
    const E_INVALID_NFT_PRICE: u64 = 10;
    const E_INVALID_AMOUNT: u64 = 11;
    const E_INVALID_DEADLINE_EXTENSION: u64 = 12;
    const E_ALREADY_APPROVED: u64 = 13;
    const E_NFT_MODE_REQUIRED: u64 = 14;
    const E_REGISTRY_ALREADY_EXISTS: u64 = 15;

    // ==================== Data Structures ====================
    
    // Main registry resource that holds all campaigns and system state
    struct Registry has key {
        admin: address,
        next_id: u64,
        campaigns: Table<u64, Campaign>,
        donations: Table<u64, u64>, // campaign_id -> donor count
        campaign_ids: vector<u64>, // For iteration
        campaigns_by_user: Table<address, vector<u64>>, // organizer -> campaign_ids
        donations_by_user: Table<address, vector<DonationRecord>>, // donor -> donations
        
        // Event handles
        campaign_created_events: EventHandle<CampaignCreatedEvent>,
        campaign_approved_events: EventHandle<CampaignApprovedEvent>,
        donation_received_events: EventHandle<DonationReceivedEvent>,
        target_reached_events: EventHandle<TargetReachedEvent>,
        deadline_extended_events: EventHandle<DeadlineExtendedEvent>,
        campaign_closed_events: EventHandle<CampaignClosedEvent>,
    }

    // Campaign data structure
    struct Campaign has store, drop, copy {
        organizer: address,
        title: String,
        description: String,
        image_url: String,
        target_amount: u64,
        raised_amount: u64,
        deadline_secs: u64,
        approved: bool,
        nft_mode: bool,
        nft_unit_price: u64,
        is_closed: bool,
        nft_collection_created: bool,
    }

    // Donation record for user profiles
    struct DonationRecord has store, drop, copy {
        campaign_id: u64,
        amount: u64,
    }

    // ==================== Events ====================
    
    struct CampaignCreatedEvent has drop, store {
        id: u64,
        organizer: address,
        title: String,
        target_amount: u64,
        deadline: u64,
        nft_mode: bool,
        nft_unit_price: u64,
    }

    struct CampaignApprovedEvent has drop, store {
        id: u64,
        admin: address,
    }

    struct DonationReceivedEvent has drop, store {
        id: u64,
        donor: address,
        amount: u64,
        total_raised: u64,
    }

    struct TargetReachedEvent has drop, store {
        id: u64,
        total_raised: u64,
    }

    struct DeadlineExtendedEvent has drop, store {
        id: u64,
        old_deadline: u64,
        new_deadline: u64,
    }

    struct CampaignClosedEvent has drop, store {
        id: u64,
        reason: String,
    }
    
    struct Getcampaign{
        id: u64,
        campaign: Campaign
    }

    // ==================== Initialize Module ====================
    
    // Initialize the crowdfunding registry
    // Can only be called once by the module publisher
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<Registry>(admin_addr), error::already_exists(E_REGISTRY_ALREADY_EXISTS));

        print(&admin_addr);

        let registry = Registry {
            admin: admin_addr,
            next_id: 1,
            campaigns: table::new(),
            donations: table::new(),
            campaign_ids: vector::empty<u64>(),
            campaigns_by_user: table::new(),
            donations_by_user: table::new(),
            campaign_created_events: account::new_event_handle<CampaignCreatedEvent>(admin),
            campaign_approved_events: account::new_event_handle<CampaignApprovedEvent>(admin),
            donation_received_events: account::new_event_handle<DonationReceivedEvent>(admin),
            target_reached_events: account::new_event_handle<TargetReachedEvent>(admin),
            deadline_extended_events: account::new_event_handle<DeadlineExtendedEvent>(admin),
            campaign_closed_events: account::new_event_handle<CampaignClosedEvent>(admin),
        };

        move_to(admin, registry);
    }

    // ==================== Campaign Creation ====================
    
    // FRONTEND: Call create_campaign() with Petra wallet signer.
    // Use form inputs for title, description, funding goal, deadline, image.
    // After transaction, refresh get_active_campaigns() to show new campaign.
    // Create a new crowdfunding campaign
    public entry fun create_campaign(
        organizer: &signer,
        title: String,
        description: String,
        image_url: String,
        target_amount: u64,
        deadline_secs: u64,
        nft_mode: bool,
        nft_unit_price: u64,
    ) acquires Registry {
        let organizer_addr = signer::address_of(organizer);
        let current_time = timestamp::now_seconds();

        // Validate inputs
        assert!(target_amount > 0, error::invalid_argument(E_INVALID_TARGET));
        assert!(deadline_secs > current_time, error::invalid_argument(E_INVALID_DEADLINE));
        assert!(!nft_mode || nft_unit_price > 0, error::invalid_argument(E_INVALID_NFT_PRICE));

        let registry = borrow_global_mut<Registry>(@crowdfunding);
        let campaign_id = registry.next_id;
        registry.next_id = registry.next_id + 1;

        let campaign = Campaign {
            organizer: organizer_addr,
            title,
            description,
            image_url,
            target_amount,
            raised_amount: 0,
            deadline_secs,
            approved: false,
            nft_mode,
            nft_unit_price,
            is_closed: false,
            nft_collection_created: false,
        };

        table::add(&mut registry.campaigns, campaign_id, campaign);
        table::add(&mut registry.donations, campaign_id, 0);
        vector::push_back(&mut registry.campaign_ids, campaign_id);

        // Track campaigns by user
        if (!table::contains(&registry.campaigns_by_user, organizer_addr)) {
            table::add(&mut registry.campaigns_by_user, organizer_addr, vector::empty<u64>());
        };
        let user_campaigns = table::borrow_mut(&mut registry.campaigns_by_user, organizer_addr);
        vector::push_back(user_campaigns, campaign_id);

        // Initialize donations by user if not exists
        if (!table::contains(&registry.donations_by_user, organizer_addr)) {
            table::add(&mut registry.donations_by_user, organizer_addr, vector::empty<DonationRecord>());
        };

        // Emit event
        event::emit_event(&mut registry.campaign_created_events, CampaignCreatedEvent {
            id: campaign_id,
            organizer: organizer_addr,
            title,
            target_amount,
            deadline: deadline_secs,
            nft_mode,
            nft_unit_price,
        });
    }

    // ==================== Admin Functions ====================
    
    // FRONTEND: Admin dashboard fetches get_active_campaigns()
    // with approved = false to list pending campaigns.
    // On "Approve" click, call approve_campaign().
    // Approve a campaign (admin only)
    public entry fun approve_campaign(admin: &signer, campaign_id: u64) acquires Registry {
        let registry = borrow_global_mut<Registry>(@crowdfunding);
        let admin_addr = signer::address_of(admin);
        
        assert!(admin_addr == registry.admin, error::permission_denied(E_NOT_ADMIN));
        assert!(table::contains(&registry.campaigns, campaign_id), error::not_found(E_CAMPAIGN_NOT_FOUND));

        let campaign = table::borrow_mut(&mut registry.campaigns, campaign_id);
        assert!(!campaign.approved, error::invalid_state(E_ALREADY_APPROVED));
        
        campaign.approved = true;

        // Emit event
        event::emit_event(&mut registry.campaign_approved_events, CampaignApprovedEvent {
            id: campaign_id,
            admin: admin_addr,
        });
    }

    // ==================== Donation Functions ====================
    
    // Donate to a campaign using coins
    public entry fun donate_with_coin(
        donor: &signer,
        campaign_id: u64,
        amount: u64,
    ) acquires Registry {
        let donor_addr = signer::address_of(donor);
        assert!(amount > 0, error::invalid_argument(E_INVALID_AMOUNT));

        let registry = borrow_global_mut<Registry>(@crowdfunding);
        assert!(table::contains(&registry.campaigns, campaign_id), error::not_found(E_CAMPAIGN_NOT_FOUND));

        let campaign = table::borrow_mut(&mut registry.campaigns, campaign_id);
        
        // Validate campaign state
        assert!(campaign.approved, error::permission_denied(E_CAMPAIGN_NOT_APPROVED));
        assert!(!campaign.is_closed, error::invalid_state(E_CAMPAIGN_CLOSED));
        assert!(timestamp::now_seconds() <= campaign.deadline_secs, error::invalid_state(E_CAMPAIGN_EXPIRED));
        assert!(campaign.raised_amount < campaign.target_amount, error::invalid_state(E_TARGET_REACHED));

        // Transfer coins from donor to organizer
        let payment = coin::withdraw<AptosCoin>(donor, amount);
        coin::deposit(campaign.organizer, payment);

        // Update campaign state
        campaign.raised_amount = campaign.raised_amount + amount;
        let donor_count = table::borrow_mut(&mut registry.donations, campaign_id);
        *donor_count = *donor_count + 1;

        // Track donations by user
        if (!table::contains(&registry.donations_by_user, donor_addr)) {
            table::add(&mut registry.donations_by_user, donor_addr, vector::empty<DonationRecord>());
        };
        let user_donations = table::borrow_mut(&mut registry.donations_by_user, donor_addr);
        vector::push_back(user_donations, DonationRecord {
            campaign_id,
            amount,
        });

        // Emit donation event
        event::emit_event(&mut registry.donation_received_events, DonationReceivedEvent {
            id: campaign_id,
            donor: donor_addr,
            amount,
            total_raised: campaign.raised_amount,
        });

        // Check if target reached
        if (campaign.raised_amount >= campaign.target_amount) {
            event::emit_event(&mut registry.target_reached_events, TargetReachedEvent {
                id: campaign_id,
                total_raised: campaign.raised_amount,
            });
        };
    }

  

    // ==================== Campaign Management ====================
    
    // FRONTEND: Organizer clicks "Extend Deadline" on their campaign page.
    // Trigger extend_deadline() transaction with new deadline.
    // Extend campaign deadline (organizer only)
    public entry fun extend_deadline(
        organizer: &signer,
        campaign_id: u64,
        new_deadline_secs: u64,
    ) acquires Registry {
        let organizer_addr = signer::address_of(organizer);
        let registry = borrow_global_mut<Registry>(@crowdfunding);
        
        assert!(table::contains(&registry.campaigns, campaign_id), error::not_found(E_CAMPAIGN_NOT_FOUND));

        let campaign = table::borrow_mut(&mut registry.campaigns, campaign_id);
        assert!(organizer_addr == campaign.organizer, error::permission_denied(E_NOT_ORGANIZER));
        assert!(!campaign.is_closed, error::invalid_state(E_CAMPAIGN_CLOSED));
        assert!(new_deadline_secs > campaign.deadline_secs, error::invalid_argument(E_INVALID_DEADLINE_EXTENSION));

        let old_deadline = campaign.deadline_secs;
        campaign.deadline_secs = new_deadline_secs;

        // Emit event
        event::emit_event(&mut registry.deadline_extended_events, DeadlineExtendedEvent {
            id: campaign_id,
            old_deadline,
            new_deadline: new_deadline_secs,
        });
    }

    // Close a campaign early (organizer or admin)
    public entry fun close_campaign(
        signer: &signer,
        campaign_id: u64,
        reason: String,
    ) acquires Registry {
        let signer_addr = signer::address_of(signer);
        let registry = borrow_global_mut<Registry>(@crowdfunding);
        
        assert!(table::contains(&registry.campaigns, campaign_id), error::not_found(E_CAMPAIGN_NOT_FOUND));

        let campaign = table::borrow_mut(&mut registry.campaigns, campaign_id);
        assert!(
            signer_addr == campaign.organizer || signer_addr == registry.admin,
            error::permission_denied(E_NOT_ORGANIZER)
        );
        assert!(!campaign.is_closed, error::invalid_state(E_CAMPAIGN_CLOSED));

        campaign.is_closed = true;

        // Emit event
        event::emit_event(&mut registry.campaign_closed_events, CampaignClosedEvent {
            id: campaign_id,
            reason,
        });
    }

    // ==================== View Functions ====================
    
    // Get campaign details
    #[view]
    public fun get_campaign(campaign_id: u64): (address, String, String, String, u64, u64, u64, bool, bool, u64, bool) acquires Registry {
        let registry = borrow_global<Registry>(@crowdfunding);
        assert!(table::contains(&registry.campaigns, campaign_id), error::not_found(E_CAMPAIGN_NOT_FOUND));
        
        let campaign = table::borrow(&registry.campaigns, campaign_id);
        (
            campaign.organizer,
            campaign.title,
            campaign.description,
            campaign.image_url,
            campaign.target_amount,
            campaign.raised_amount,
            campaign.deadline_secs,
            campaign.approved,
            campaign.nft_mode,
            campaign.nft_unit_price,
            campaign.is_closed
        )
    }

    // FRONTEND: Fetch get_active_campaigns() to display all running campaigns.
    // Use in the homepage or campaigns listing page.
    // Get all active campaigns (not closed and not expired)
    #[view]
    public fun get_active_campaigns(): vector<Getcampaign> acquires Registry {
        let registry = borrow_global<Registry>(@crowdfunding);
        let active_campaigns = vector::empty<Getcampaign>();
        let current_time = timestamp::now_seconds();
        
        let i = 0;
        let len = vector::length(&registry.campaign_ids);
        
        while (i < len) {
            let campaign_id = *vector::borrow(&registry.campaign_ids, i);
            let campaign = table::borrow(&registry.campaigns, campaign_id);
            
            // Active campaign = not closed AND deadline not expired
            // if (!campaign.is_closed && campaign.deadline_secs > current_time) {
            // };
                vector::push_back(&mut active_campaigns, Getcampaign { id: campaign_id, campaign: *campaign });
            
            i = i + 1;
        };
        
        active_campaigns
    }

    // FRONTEND: Call get_user_profile(petraAddress) to show user dashboard.
    // Tab 1: Campaigns Created (click to view/manage)
    // Tab 2: Donations Made (history).
    // Get user profile: campaigns created and donations made
   #[view]
public fun get_user_profile(addr: address): (vector<u64>, vector<Getcampaign>) acquires Registry {
    let registry = borrow_global<Registry>(@crowdfunding);

    let campaigns_created = if (table::contains(&registry.campaigns_by_user, addr)) {
        *table::borrow(&registry.campaigns_by_user, addr)
    } else {
        vector::empty<u64>()
    };

    let donations_made = if (table::contains(&registry.donations_by_user, addr)) {
        let user_donations = table::borrow(&registry.donations_by_user, addr);
        let donations_formatted = vector::empty<Getcampaign>();

        let i = 0;
        let len = vector::length(user_donations);
        while (i < len) {
            let donation = vector::borrow(user_donations, i);
            let campaign = table::borrow(&registry.campaigns, donation.campaign_id);
            vector::push_back(&mut donations_formatted, Getcampaign {
                id: donation.campaign_id,
                campaign: *campaign
            });
            i = i + 1;
        };

        donations_formatted
    } else {
        vector::empty<Getcampaign>()
    };

    (campaigns_created, donations_made)
}


    // FRONTEND: Call is_user(petraAddress) after wallet connect.
    // If false, show "New User" onboarding.
    // Check if user exists (has created campaigns or made donations)
    #[view]
    public fun is_user(addr: address): bool acquires Registry {
        let registry = borrow_global<Registry>(@crowdfunding);
        
        table::contains(&registry.campaigns_by_user, addr) || 
        table::contains(&registry.donations_by_user, addr)
    }

    // Get total number of donations for a campaign
    #[view]
    public fun get_donor_count(campaign_id: u64): u64 acquires Registry {
        let registry = borrow_global<Registry>(@crowdfunding);
        assert!(table::contains(&registry.donations, campaign_id), error::not_found(E_CAMPAIGN_NOT_FOUND));
        *table::borrow(&registry.donations, campaign_id)
    }

    // Get registry admin
    #[view]
    public fun get_admin(): address acquires Registry {
        let registry = borrow_global<Registry>(@crowdfunding);
        registry.admin
    }

    // Get next campaign ID
    #[view]
    public fun get_next_id(): u64 acquires Registry {
        let registry = borrow_global<Registry>(@crowdfunding);
        registry.next_id
    }

    // Check if a given address is the admin
    #[view]
    public fun is_admin(addr: address): bool acquires Registry {
        let registry = borrow_global<Registry>(@crowdfunding);
        addr == registry.admin
    }

}