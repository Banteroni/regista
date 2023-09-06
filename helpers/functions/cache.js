import { Event, Match, Player } from "../../db/models.js";
import Starting from "../../db/models/Starting.js";
import instance from "../scraper/instance.js";
import { appendEvent, roleSwitch } from "./common.js";

//set a player to the database
export const setPlayer = async (player) => {
    let { data } = await instance.get(
        `https://next-api-mtc.gazzetta.it/api/info/v1/player/info?sportId=1&playerId=${player}`
    );
    data = data.data;
    const object = {
        id: parseInt(player),
        name: data.firstName,
        surname: data.lastName,
        displayName: data.info.knownName ? data.info.knownName : null,
        position: roleSwitch(data.info.role),
        weight: data.info.weight == "Unknown" ? null : data.info.weight,
        height: data.info.height == "Unknown" ? null : data.info.height,
        foot: data.info.preferredFoot ? data.info.preferredFoot : null,
        TeamId: parseInt(data.team.id),
        country: data.info.country,
        number: data.info.jerseyNum ? data.info.jerseyNum : null,
    };
    const record = await Player.findOrCreate({ where: { ...object } });
    return record;


}

//set events to the database
export const setEvents = async (events, matchId) => {

    if (events === null) {
        const match = await Match.findOne({ where: { id: matchId } })
        if (match === null) {
            throw new Error("match not found")
        }
        else {
            events = []
            await Event.destroy({ where: { MatchId: matchId } })
            const votations = await instance.get(
                `/events/votations?sportId=1&competitionId=${match.LeagueId}&matchId=${matchId}`
            );
            const { data } = votations
            const votationsData = data.data;
            for (const v of votationsData.awayTeam.mainPlayers) {
                appendEvent(events, v);
            }
            for (const v of votationsData.awayTeam.benchPlayers) {
                appendEvent(events, v);
            }
            for (const v of votationsData.homeTeam.benchPlayers) {
                appendEvent(events, v);
            }
            for (const v of votationsData.homeTeam.mainPlayers) {
                appendEvent(events, v);
            }
            for (const event of events) {
                await Event.create({
                    type: event.type,
                    timing: event.minute,
                    PlayerId: event.playerId,
                    MatchId: matchId

                })
            }
            await Match.update({ eventsInserted: true }, { where: { id: matchId } })

        }


    }
    else {
        await Event.destroy({ where: { MatchId: matchId } })
        for (const event of events) {
            await Event.create({
                type: event.type,
                timing: event.timing,
                PlayerId: event.playerId,
                MatchId: matchId

            })
        }


    }


}


//set the starting player situation to the database
export const setStarting = async (matchId, position, playerId, teamId, captain) => {
    const record = await Starting.create({
        position: position,
        MatchId: matchId,
        TeamId: teamId,
        captain: captain ? 1 : 0,
        PlayerId: playerId
    })
    return record
}

//archive the match in the database
export const setCached = async (matchId) => {
    await Match.update({ cached: true }, { where: { id: matchId } })
}
