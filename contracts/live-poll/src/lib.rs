#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, panic_with_error, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Yes,
    No,
    Voter(Address),
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct PollResults {
    pub yes: u32,
    pub no: u32,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum LivePollError {
    AlreadyVoted = 1,
}

#[contract]
pub struct LivePollContract;

fn ensure_not_voted(env: &Env, user: &Address) {
    if env
        .storage()
        .persistent()
        .has(&DataKey::Voter(user.clone()))
    {
        panic_with_error!(env, LivePollError::AlreadyVoted);
    }
}

fn mark_voted(env: &Env, user: &Address) {
    env.storage()
        .persistent()
        .set(&DataKey::Voter(user.clone()), &true);
}

fn increment_vote(env: &Env, key: DataKey) {
    let current = env
        .storage()
        .persistent()
        .get::<_, u32>(&key)
        .unwrap_or(0);

    env.storage().persistent().set(&key, &(current + 1));
}

#[contractimpl]
impl LivePollContract {
    pub fn vote_yes(env: Env, user: Address) {
        user.require_auth();
        ensure_not_voted(&env, &user);
        increment_vote(&env, DataKey::Yes);
        mark_voted(&env, &user);
    }

    pub fn vote_no(env: Env, user: Address) {
        user.require_auth();
        ensure_not_voted(&env, &user);
        increment_vote(&env, DataKey::No);
        mark_voted(&env, &user);
    }

    pub fn get_results(env: Env) -> PollResults {
        let yes = env
            .storage()
            .persistent()
            .get::<_, u32>(&DataKey::Yes)
            .unwrap_or(0);
        let no = env
            .storage()
            .persistent()
            .get::<_, u32>(&DataKey::No)
            .unwrap_or(0);

        PollResults { yes, no }
    }
}

#[cfg(test)]
mod test {
    use super::{LivePollContract, LivePollContractClient, LivePollError, PollResults};
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn counts_one_vote_per_wallet() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(LivePollContract, ());
        let client = LivePollContractClient::new(&env, &contract_id);

        let voter_one = Address::generate(&env);
        let voter_two = Address::generate(&env);

        client.vote_yes(&voter_one);
        client.vote_no(&voter_two);

        let results = client.get_results();

        assert_eq!(results, PollResults { yes: 1, no: 1 });
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #1)")]
    fn rejects_second_vote_from_same_wallet() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(LivePollContract, ());
        let client = LivePollContractClient::new(&env, &contract_id);

        let voter = Address::generate(&env);

        client.vote_yes(&voter);

        let results = client.get_results();
        assert_eq!(results, PollResults { yes: 1, no: 0 });

        let _ = LivePollError::AlreadyVoted;
        client.vote_no(&voter);
    }
}
