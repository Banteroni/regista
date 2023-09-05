import { Team } from "../db/models.js"

export const getTeams = async (req, res) => {

    let teams = []
    if (req.query.league) {
        teams = await Team.findAll({ where: { leagueId: league_id } })


    }
    else {
        teams = await Team.findAll()
    }

    return res.send(teams)
}

export const getTeam = async (req, res) => {
    const { id } = req.params
    const team = await Team.findOne({ where: { id } })
    return res.send(team)
}