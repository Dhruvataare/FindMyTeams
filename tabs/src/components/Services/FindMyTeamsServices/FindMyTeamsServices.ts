import { AnyAaaaRecord } from "dns";
import { useGraph } from "@microsoft/teamsfx-react";
import { Providers, ProviderState } from '@microsoft/mgt-element';
import { TeamsFxProvider } from '@microsoft/mgt-teamsfx-provider';
import { useContext } from "react";
import { TeamsFxContext } from "../../Context";

export function GetAllTags() {
    const { teamsfx } = useContext(TeamsFxContext);
    const { loading, error, data, reload } = useGraph(
        async (graph, teamsfx, scope) => {
            let tags = [] as any;
            // Initialize Graph Toolkit TeamsFx provider
            const provider = new TeamsFxProvider(teamsfx, scope);
            Providers.globalProvider = provider;
            Providers.globalProvider.setState(ProviderState.SignedIn);

            try {
                let tagsData = await graph.api("/termStore/groups/f772d631-33c9-4588-a5f9-cb083e81c493/sets").version("beta").get();
                for (let value of tagsData.value) tags.push(value.localizedNames[0].name);
            }
            catch {
                console.error(error);
            }
            return { tags }
        },
        { scope: ["User.Read", "TeamMember.Read.All", "TeamMember.ReadWrite.All"], teamsfx: teamsfx }
    );
    return { allTagsData: data, allTagsLoading: loading, allTagsError: error, allTagsReload: reload }
}
export function GetAllTeams() {
    const { loading, error, data, reload } = useGraph(
        async (graph) => {
            let teamsData: any;
            let allTags = [] as any;
            let myProfile: any;
            let teamMembersData = [] as any;
            let manageTeamsData = [] as any;
            let teamMembersDataLength: any;
            let batchTeamsData = await graph.api("/$batch")
                .header("content-type", "application/json")
                .post({
                    "requests": [

                        {
                            "id": "myProfile",
                            "method": "GET",
                            "url": "/me?$select=displayName"
                        },
                        {
                            "id": "joinedTeams",
                            "method": "GET",
                            "url": "/me/joinedTeams?$select=id,displayName,description"
                        }
                    ]
                });
            batchTeamsData.responses.map((itm: any, idx: number) => {
                switch (itm.id) {
                    case "myProfile":
                        myProfile = itm.body.displayName;
                        break;
                    case "joinedTeams":
                        teamsData = itm.body.value;
                        teamMembersDataLength = itm.body["@odata.count"];
                        break;
                    default:
                        break;
                }
            })

            try {
                //GETTING ALL TAGS FROM TERMSTORE
                let tagsData = await graph.api("/termStore/groups/f772d631-33c9-4588-a5f9-cb083e81c493/sets").version("beta").get();
                for (let value of tagsData.value) allTags.push(value.localizedNames[0].name);
                let tagsFromExtension = [] as any;
                await Promise.all(
                    teamsData?.map(async (teamData: any, idx: number) => {
                        let teamLinkData = [] as any;
                        let teamMembers: any;
                        let reqTags: any;
                        let teamObj = {
                            id: "",
                            createdDateTime: null,
                            displayName: "",
                            description: "",
                            userRole: false,
                            teamLink: "",
                            tags: undefined
                        };

                        let batchMembersData = await graph.api("/$batch")
                            .header("content-type", "application/json")
                            .post({
                                "requests": [
                                    {
                                        "id": "teamLink",
                                        "method": "GET",
                                        "url": "/teams/" + teamData.id + "?$select=createdDateTime,webUrl"
                                    },
                                    {
                                        "id": "members",
                                        "method": "GET",
                                        "url": "/teams/" + teamData.id + "/members?$select=displayName,roles&$filter=startswith(displayName, '" + myProfile + "') and roles/any()"
                                    },
                                    {
                                        "id": "tags",
                                        "method": "GET",
                                        "url": "groups/" + teamData.id + "?$select=id,displayName,extensions&$expand=extensions"
                                    }
                                ]
                            });
                        batchMembersData.responses.map((itm: any, idx: number) => {
                            switch (itm.id) {
                                case "teamLink":
                                    teamLinkData = itm.body;
                                    break;
                                case "members":
                                    teamMembers = itm.body;
                                    break;
                                case "tags":
                                    tagsFromExtension = itm.body.extensions;
                                    if (tagsFromExtension.length > 0) {
                                        tagsFromExtension.map((tagItm: any) => {
                                            if (tagItm.id.indexOf('organizationalTags') !== -1) {
                                                reqTags = tagItm.tags;
                                            }
                                            else {
                                                reqTags = undefined;
                                            }
                                        })
                                    }
                                    else {
                                        reqTags = undefined;
                                    }
                                    break;
                                default:
                                    break;
                            }
                        })

                        teamObj.id = teamData.id;
                        teamObj.createdDateTime = teamLinkData.createdDateTime;
                        teamObj.displayName = teamData.displayName || teamData.teamName;
                        teamObj.description = teamData.description ? teamData.description : "";
                        teamObj.userRole = false;
                        teamObj.teamLink = teamLinkData.webUrl;
                        teamObj.tags = reqTags;

                        teamMembers.value.map((tdata: any) => {
                            teamObj.userRole = true;
                        });
                        teamMembersData.push(teamObj);
                    })
                );
                let reqManageTeams = teamMembersData.filter((teamMember: any, idx: number) => teamMember.userRole);
                manageTeamsData.push.apply(manageTeamsData, reqManageTeams);
            }
            catch {
                console.error(error);
            }
            localStorage.setItem('dashboardLocalStorageData', JSON.stringify({ teamMembersData, teamMembersDataLength }));
            localStorage.setItem('manageTeamsLocalStorageData', JSON.stringify({ manageTeamsData }));
            localStorage.setItem('allTagsLocalStorageData', JSON.stringify({ allTags }));

            return { teamMembersData, manageTeamsData, allTags }
        },
        { scope: ["User.Read", "TeamMember.Read.All", "TeamMember.ReadWrite.All"] }
    );
    return { allTeamsData: data, allTeamsLoading: loading, allTeamsError: error, allTeamsReload: reload }
}

export function CreateOpenExtensionObject(teams: any, selectedTags: any) {
    let reqTags: any;
    if (selectedTags.length > 0) {
        reqTags = selectedTags.toString();
    };
    const { loading, error, data, reload } = useGraph(
        async (graph) => {
            let postExtensionObj;
            let updatedTags;
            try {
                await teams.map((team: any) => {
                    //checking to create new extension object.
                    let isTags = team.hasOwnProperty('tags');
                    if (selectedTags !== false) {
                        if (team.tags === undefined) {
                            postExtensionObj = graph.api("/groups/" + team.id + "/extensions")
                                .header("content-type", "application/json")
                                .post({
                                    "@odata.type": "microsoft.graph.openTypeExtension",
                                    "extensionName": "com.contoso.organizationalTags" + team.id,
                                    "tags": reqTags
                                });
                        }
                        //patch to existing extension object.
                        else {
                            //while patching, check werther selected tag/s is present in extension obj
                            //here, whenever we patch the reqtags replaces the previous tags, it doesn't append with the previous tags.
                            //concat existing and newtags and remove duplicates and pass to post obj.
                            let allTags = team.tags.length > 0 ? team.tags + "," + reqTags : reqTags;
                            let reqAllTags = allTags !== "" ? allTags.split(",") : allTags;
                            updatedTags = reqAllTags.filter((value: any, idx: number, self: any) => self.indexOf(value) === idx);//.splice(self.indexOf(",false"),1)
                            postExtensionObj = graph.api("/groups/" + team.id + "/extensions/com.contoso.organizationalTags" + team.id)
                                .header("content-type", "application/json")
                                .patch({
                                    "tags": updatedTags.toString()
                                });
                        }
                    }
                })

            } catch {
                console.log(error);
            }
            return { postExtensionObj }
        },
        { scope: ["User.Read"] }
    );
    return { data, loading, error, reload }
}
export function UpdateTagsOpenExtension(selectedTeams: any, selectedTags: any) {
    const { loading, error, data, reload } = useGraph(
        async (graph) => {
            let removeTagsData;
            let updatedTags: any;
            try {
                if (selectedTags !== false) {
                    selectedTeams.map((itm: any, idx: number) => {
                        let selectedTagsArr = itm.tags.split(',');
                        let reqTag = selectedTags.filter((tag: any) => {
                            let tagIdx = selectedTagsArr.indexOf(tag);
                            if (tagIdx > -1) {
                                selectedTagsArr.splice(tagIdx, 1);
                                updatedTags = selectedTagsArr;
                            }
                            else {
                                updatedTags = itm.selectedTagsArr;
                            }
                        });
                        removeTagsData = graph.api("/groups/" + itm.id + "/extensions/com.contoso.organizationalTags" + itm.id)
                            .header("content-type", "application/json")
                            .patch({
                                "tags": updatedTags.toString()
                            });
                    })
                }
            } catch {
                console.error(error);
            }
            return { removeTagsData }
        },
        { scope: ["User.Read"] }
    );
    return {
        removeTagsData: data, removeTagsloading: loading, removeTagserror: error, removeTagsreload: reload
    }
}

export function GetTeamMembers(teamsData: any) {
    const { loading, error, data, reload } = useGraph(
        async (graph) => {
            let teamMembersData = [] as any;
            let myProfile = await graph.api("/me").get();
            try {
                await Promise.all(
                    teamsData.map(async (teamData: any, idx: number) => {
                        let teamId = teamData.id;
                        let teamName = teamData.displayName || teamData.teamName
                        let teamMembers = await graph.api("/teams/" + teamId + "/members").get();
                        teamMembers["teamId"] = teamId;
                        teamMembers["userTeamName"] = teamName;
                        teamMembersData.push(teamMembers);
                    })
                );
            } catch {
                // error
                console.error(error);
            }
            return { teamMembersData, myProfile }
        },
        { scope: ["User.Read", "TeamMember.Read.All", "TeamMember.ReadWrite.All"] }
    );
    return { membersData: data, membersLoading: loading, membersError: error, membersReload: reload }
}

export function GetAllOrgUsers() {
    const { loading, error, data, reload } = useGraph(
        async (graph) => {
            let orgUsers;
            try {
                orgUsers = await graph.api("/users")
                    .select("id,mail,displayName,userPrincipalName")
                    .filter("accountEnabled eq true")
                    .get();
            } catch {
                console.error(error);
            }

            return { orgUsers }
        },
        { scope: ["User.Read"] }
    );
    return { orgUsersData: data, orgUsersLoading: loading, orgUsersError: error, orgUsersReload: reload }
}

export function GetAllChannels(teamData: any) {
    const { loading, error, data, reload } = useGraph(
        async (graph) => {
            let channels = null;
            let teamName = "";
            try {
                let id = teamData.id;
                teamName = teamData.displayName;
                channels = await graph.api("/teams/" + id + "/channels")
                    .select("id,displayName,description,webUrl,isFavoriteByDefault")
                    .get();
            } catch {
                console.error(error);
            }
            return { teamName, channels }
        },
        { scope: ["User.Read"] }
    );
    return { data, loading, error, reload }
}

export function GetAllChannelDocuments(teamData: any) {
    const { loading, error, data, reload } = useGraph(
        async (graph) => {
            let channelDocuments = null;
            try {
                let id = teamData.id;
                channelDocuments = await graph.api("groups/" + id + "/drive/items/root/children")
                    .select("id,name,lastModifiedDateTime,webUrl,lastModifiedBy")
                    .get();
            } catch {
                // error.
            }
            return { channelDocuments }
        },
        { scope: ["User.Read"] }
    );
    return { data, loading, error, reload }
}
export function GetAllUsersOfTeam(teamData: any) {
    const { loading, error, data, reload } = useGraph(
        async (graph) => {
            let users = null;
            let teamName = "";
            try {
                let id = teamData.id;
                teamName = teamData.displayName;
                users = await graph.api("/groups/" + id + "/members")
                    .select("id,displayName,jobTitle,userPrincipalName")
                    .get();
            } catch {
                // error.
            }
            return { teamName, users }
        },
        { scope: ["User.Read"] }
    );
    return { data, loading, error, reload }
}
export function AddMembersToTeams(teamsData: any, membersData?: any) {
    const actionResultPart = {
        values: membersData
    };
    const { loading, error, data, reload } = useGraph(
        async (graph) => {
            let userData;
            try {
                if (membersData !== false) {
                    await teamsData.map((itm: any, idx: number) => {
                        userData = graph.api("/teams/" + itm.id + "/members/add")
                            .header("content-type", "application/json")
                            .post(actionResultPart);
                    })
                }

            } catch {
                // error
            }
            return { userData }
        },
        { scope: ["User.Read"] }
    );
    return { data, loading, error, reload }
}
export function RemoveMembersFromTeams(teamsData: any) {
    const { loading, error, data, reload } = useGraph(
        async (graph) => {
            let userData;
            try {
                await teamsData.map((itm: any, idx: number) => {
                    if (itm.membershipId !== null) {
                        userData = graph.api("/teams/" + itm.teamId + "/members/" + itm.membershipId).delete();
                    }
                })

            } catch {
                console.error(error);
            }
            return { userData }
        },
        { scope: ["User.Read"] }
    );
    return {
        removeMembersData: data, removeMembersloading: loading, removeMemberserror: error, removeMembersreload: reload
    }
}
export function getFilteredArr(arrayToFilter: any, filterField: string, seen: any) {
    // let seen = new Set();
    const filteredPlans = arrayToFilter.filter((el: any) => {
        const duplicate = seen.has(el[filterField]);
        seen.add(el[filterField]);
        return !duplicate;
    });
    return filteredPlans;
}
export function removeDuplicates(data: any) {
    return data.filter((value: any, idx: number, self: any) => self.indexOf(value) === idx);
}

