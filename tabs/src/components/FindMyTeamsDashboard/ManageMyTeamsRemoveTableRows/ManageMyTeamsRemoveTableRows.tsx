import { useState, useEffect } from "react";
import "./ManageMyTeamsRemoveTableRows.css";
import { RemoveTableRowsGrid } from "./RemoveTableRowsGrid";
import { GridRenderCellParams } from '@mui/x-data-grid';
import { Segment, Text, Skeleton, FlexItem, Flex, Dialog, Button, Input } from "@fluentui/react-northstar";
import { SearchIcon, ParticipantRemoveIcon, CloseIcon } from '@fluentui/react-icons-northstar';
import { RemoveMembersFromTeams, GetTeamMembers } from '../../Services/FindMyTeamsServices/FindMyTeamsServices';
import constants from "../../Services/lib/constants.json";

export function ManageMyTeamsRemoveTableRows(props: { teamsData: any, manageMyTeamsState: any, getManageMyTeamsState: any, selectedMenuOption: string }) {
    const { teamsData, manageMyTeamsState, getManageMyTeamsState } = { ...props }

    const [membersSearchValue, getMembersSearchValue] = useState("");
    const [isSearchResults, getSearchResult] = useState(true);
    const [isPortal, togglePortal] = useState(false);
    const [isDialog, toggleDialog] = useState(false);
    const [removeMembers, getRemoveMembersData] = useState([]);
    const membersheader = {
        items: [
            { field: constants.TeamsHeader.fieldMember, headerName: constants.TeamsHeader.headerMember, flex: 1 },
            { field: constants.TeamsHeader.fieldTeamName, headerName: constants.TeamsHeader.headerTeamName, flex: 1 },
            {
                field: constants.TeamsHeader.fieldEmail, headerName: constants.TeamsHeader.headerEmail, flex: 1, renderCell: (user: GridRenderCellParams<any>) => {
                    return <a target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }} title={user.value.email} href={`mailto:${user.value.email}`}>{user.value.email}</a>
                }
            }

        ]
    }
    const { membersData, membersLoading, membersError, membersReload } = GetTeamMembers(teamsData);

    let allmembersData: any = [];
    membersData?.teamMembersData.map((memberData: any, i: number) => {
        memberData?.value.map((member: any, idx: number) => {
            let teamNames = teamsData.filter((itm: any, index: number) => {
                if (memberData.teamId === itm.id) return { teamName: itm.teamName, teamId: itm.id };
            });
            if (teamNames.length > 0) {
                if (member.roles.length === 0 || member.roles[0] === constants.MemberRoles.guest) {
                    allmembersData.push({
                        key: member.id,
                        id: member.id,
                        headerEmail: member,
                        email: member.email,
                        membershipId: member.id,
                        member: member.displayName,
                        teamId: teamNames[0].id,
                        teamName: teamNames[0].teamName,
                        isOwner: member.roles.length > 0 ? true : false,
                        role: member.roles.length > 0 ? member.roles[0] : constants.MemberRoles.member
                    })
                }

            }
        });
    });

    const [members, getMembers] = useState(allmembersData);

    const { removeMembersData, removeMembersloading, removeMemberserror, removeMembersreload } = RemoveMembersFromTeams(removeMembers.length > 0 && removeMembers);

    useEffect(() => {
        getMembers(allmembersData);
    }, []);

    useEffect(() => {
        let filteredMemberData = [];
        if (membersData?.teamMembersData) {
            if (membersSearchValue !== "") {
                filteredMemberData = [...allmembersData].filter((itm: any, idx: number) => {
                    return itm.member.toUpperCase().indexOf(membersSearchValue) > -1
                });
                getMembers(filteredMemberData);
                (filteredMemberData.length === 0) ? getSearchResult(false) : getSearchResult(true);
            }
            else {
                getMembers(allmembersData);
                getSearchResult(true);
            }
        }

    }, [membersSearchValue]);

    const onKeyPress = (e: any) => {
        let keyValue = e.target.value;
        if (e.keyCode === 13) {
            getMembersSearchValue(keyValue.toUpperCase());
        }
        if (e.keyCode === 8 && e.target.defaultValue.length === 1) {
            getMembersSearchValue("");
        }

    }
    const onSearchTextDelete = (e: any, data: any) => {
        if (data.value === "") getMembersSearchValue("");
    }
    const removeUsers = () => {
        togglePortal(false);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: false, isAlertVisible: true, alertMessage: constants.AlertMessages.userRemovedSuccess });
        setTimeout(() => {
            getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: false, isAlertVisible: false });
        }, 3000);
        removeMembers.length > 0 && removeMembersreload();
    }

    const onCancel = () => {
        togglePortal(false);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: false });
    }
    const onDialogCancel = () => {
        toggleDialog(false);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: true });
    }
    const handlePortal = () => {
        togglePortal(true);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: true });
        membersReload();
    }
    return (
        <Dialog
            open={isPortal}
            className="RemoveTableRowsContainer"
            content={
                <div >
                    <Segment inverted color="brand" className="RemoveTableRowsHeader">
                        <Flex gap="gap.small">
                            <ParticipantRemoveIcon />
                            <Text content="Remove Users" className="teamName" align="center" size="medium" weight="bold" />
                            <FlexItem push>
                                <Button
                                    icon={<CloseIcon />}
                                    className="closeButton"
                                    text
                                    iconOnly
                                    title={constants.BtnClose}
                                    onClick={onCancel}
                                />
                            </FlexItem>
                        </Flex>
                    </Segment>
                    <Segment className="RemoveTableRowsBody">
                        <Text
                            content={
                                <>
                                    Remove members from selected teams.
                                    <span style={{ fontSize: "0.8em" }}>(To remove owner(s), please use Teams)</span>
                                </>
                            }
                            size="medium"
                            weight="semibold"
                        />
                        <Input
                            clearable
                            fluid
                            icon={<SearchIcon />}
                            placeholder={constants.SearchUserPlaceHolder}
                            iconPosition="end"
                            onKeyDown={onKeyPress}
                            onChange={onSearchTextDelete}
                        />
                        <div className="memberGrid">
                            {membersLoading ?
                                <Skeleton animation="wave">
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                </Skeleton>
                                : isSearchResults
                                    ? <RemoveTableRowsGrid getRemoveMembersData={getRemoveMembersData} header={membersheader} rows={members === false ? allmembersData : members} />
                                    : <div className="NoResultsMessage">Oops!! No Results Found.</div>
                            }
                        </div>
                        <Flex gap="gap.small" padding="padding.medium" hAlign="end">
                            {_renderUserDialog(removeUsers, onDialogCancel, removeMembers)}
                            <Button secondary onClick={onCancel} content={constants.BtnCancel} />
                        </Flex>
                    </Segment>
                </div>
            }
            trigger={<Button
                icon={<ParticipantRemoveIcon outline rotate={0} size="large" />}
                text
                title={constants.RemoveUsers}
                inverted
                disabled={(teamsData.length === 0) ? true : false}
                content={"Remove"}
                onClick={handlePortal}
            />}
        />
    );
}
const _renderUserDialog = (removeUsers: any, onDialogCancel: any, removeMembers: any) => {
    return (
        <Dialog
            cancelButton={constants.BtnCancel}
            confirmButton={constants.BtnConfirm}
            closeOnOutsideClick={false}
            onCancel={onDialogCancel}
            onConfirm={removeUsers}
            header={constants.RemoveUserHeader}
            trigger={<Button primary content="Remove User(s)" disabled={removeMembers.length === 0 ? true : false} />}
        />
    )
}
