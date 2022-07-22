import { useState, useEffect } from "react";
import "./ManageMyTeamsAddTableRows.css";
import { Segment, Skeleton, Text, Flex, FlexItem, Button, Dropdown, Dialog } from "@fluentui/react-northstar";
import { ParticipantAddIcon, CloseIcon } from '@fluentui/react-icons-northstar';
import { AddMembersToTeams, removeDuplicates, GetAllOrgUsers, GetTeamMembers } from '../../Services/FindMyTeamsServices/FindMyTeamsServices';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import constants from "../../Services/lib/constants.json";

export function ManageMyTeamsAddTableRows(props: { teamsData: any, manageMyTeamsState: any, getManageMyTeamsState: any, selectedMenuOption: string }) {
    const { teamsData, manageMyTeamsState, getManageMyTeamsState } = { ...props }
    const [addTableRowsState, getAddTableRowsState] = useState<any>({
        selectedUsers: [],
        selectedUsersToAdd: []
    });
    const [isPortal, togglePortal] = useState(false);
    const [isDialog, toggleDialog] = useState(false);
    const [isAddUserButtonDisabled, toggleAddUserButton] = useState(true);
    const [pageSize, setPageSize] = useState<number>(10);
    const { orgUsersData, orgUsersLoading, orgUsersError, orgUsersReload } = GetAllOrgUsers();
    let allOrgUsersData: any = [];
    let reqUserData: any = [];
    orgUsersData?.orgUsers.value.map((orgUser: any, i: number) => {
        reqUserData.push({
            id: orgUser.id,
            member: orgUser.displayName,
            email: orgUser.mail,
            userPrincipalName: orgUser.userPrincipalName
        })
        allOrgUsersData.push(`${orgUser.displayName}` + ` (` + `${orgUser.userPrincipalName})`)

    });
    const [orgUsers, getOrgUsers] = useState(allOrgUsersData);

    const membersheader = {
        items: [
            { field: constants.TeamsHeader.fieldMember, headerName: constants.TeamsHeader.headerMember, flex: 1 },
            { field: constants.TeamsHeader.fieldTeamName, headerName: constants.TeamsHeader.headerTeamName, flex: 1 },
            { field: constants.TeamsHeader.fieldRole, headerName: constants.TeamsHeader.headerRole, width:120 },
            {
                field: constants.TeamsHeader.fieldEmail, headerName: constants.TeamsHeader.headerEmail, flex: 1, sortable: false, renderCell: (user: GridRenderCellParams<any>) => {
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
                if (member.roles.length === 0 || member.roles[0] === constants.MemberRoles.guest || member.roles[0] === constants.MemberRoles.owmer) {
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

    useEffect(() => {
        getOrgUsers(allOrgUsersData);
        getMembers(allmembersData);
    }, []);


    const { data, loading, error, reload } = AddMembersToTeams(teamsData, addTableRowsState.selectedUsersToAdd.length > 0 && addTableRowsState.selectedUsersToAdd);
    const addUsers = () => {
        if (addTableRowsState.selectedUsers.length > 0) {
            let reqSelectedUserData: any = [];
            reqUserData.map((reqUser: any, idx: number) => {
                addTableRowsState.selectedUsers.filter((itm: any, i: number) => {
                    if (itm.userPrincipalName === reqUser.userPrincipalName) {
                        reqSelectedUserData.push({
                            '@odata.type': 'microsoft.graph.aadUserConversationMember',
                            'roles': [],
                            'user@odata.bind': constants.GraphUrl + '/v1.0/users(\'' + reqUser.id + '\')'
                        })
                    }
                })
            });
            getAddTableRowsState({ ...addTableRowsState, selectedUsersToAdd: reqSelectedUserData });
        }
        togglePortal(false);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: false, isAlertVisible: true, alertMessage: constants.AlertMessages.userAddedSuccess });
        setTimeout(() => {
            getManageMyTeamsState({ ...addTableRowsState, isPopupOpen: false, isAlertVisible: false });
        }, 3000);

    };
    useEffect(() => {
        postUsers();
    }, [addTableRowsState.selectedUsersToAdd]);

    const postUsers = () => {
        addTableRowsState.selectedUsersToAdd.length > 0 && reload();
    }
    const onCancel = () => {
        togglePortal(false);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: false });
    };
    const onDialogCancel = () => {
        toggleDialog(false);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: true });
    };
    const handlePortal = () => {
        togglePortal(true);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: true });
        orgUsersReload();
        membersReload();
    };

    const handleSearch = (e: any, data: any) => {
        (data.value.length > 0) ? toggleAddUserButton(false) : toggleAddUserButton(true);
        let reqUsers = data.value.map((itm: any) => {
            let reqUserName = itm.split("(");
            let reqUserPrincipalName = reqUserName[1].split(")");
            let reqEmail = reqUserPrincipalName[0].split("#");
            return {
                name: reqUserName[0],
                email: reqEmail[0],
                userPrincipalName: reqUserPrincipalName[0]
            };
        });
        let reqSelectedUsers = [] as any;
        reqSelectedUsers.push.apply(reqSelectedUsers, reqUsers);
        getAddTableRowsState({ ...addTableRowsState, selectedUsers: reqSelectedUsers });
    };

    const getA11ySelectionMessage = {
        onAdd: (item: any) => `${item} selected. Press left or right arrow keys to navigate selected items.`,
        onRemove: (item: any) => `${item} has been removed.`,
    };

    return (
        <Dialog
            open={isPortal}
            className="AddTableRowsContainer"
            content={
                <div >
                    <Segment inverted color="brand" className="AddTableRowsHeader">
                        <Flex gap="gap.small">
                            <ParticipantAddIcon />
                            <Text content="Add Users" className="teamName" align="center" size="medium" weight="bold" />
                            <FlexItem push>
                                <Button
                                    icon={<CloseIcon />}
                                    className="closeButton"
                                    text
                                    iconOnly
                                    title="Close"
                                    onClick={onCancel}
                                />
                            </FlexItem>
                        </Flex>
                    </Segment>
                    <Segment className="AddTableRowsBody">
                        <Text content="Add users as members to selected teams." size="medium" weight="semibold" />
                        <Dropdown
                            multiple
                            search
                            fluid
                            items={removeDuplicates(allOrgUsersData)}
                            placeholder={constants.SearchUserPlaceHolder}
                            getA11ySelectionMessage={getA11ySelectionMessage}
                            noResultsMessage={constants.NoResultsMessage}
                            a11ySelectedItemsMessage={constants.a11ySelectedItemsMessage}
                            onChange={handleSearch}
                        />
                        <div className="memberGrid">
                            <Text content="List of existing members of selected teams." />
                            {membersLoading ?
                                <Skeleton animation="wave">
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                    <Skeleton.Line height="3rem" />
                                </Skeleton>
                                :
                                <div style={{ width: '100%', height: 370 }}>
                                    <DataGrid
                                        rows={members === false || members.length === 0 ? allmembersData : members}
                                        columns={membersheader.items}
                                        pageSize={pageSize}
                                        disableColumnMenu
                                        pagination
                                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                                        rowsPerPageOptions={[10, 25, 50]}
                                    />
                                </div>
                            }
                        </div>
                        <Flex gap="gap.small" padding="padding.medium" hAlign="end">
                            {_renderUserDialog(addUsers, onDialogCancel, isAddUserButtonDisabled)}
                            <Button secondary onClick={onCancel} content={constants.BtnCancel} />
                        </Flex>
                    </Segment>
                </div>
            }
            trigger={<Button
                icon={<ParticipantAddIcon outline rotate={0} size="large" />}
                text
                title={constants.AddUsers}
                inverted
                disabled={(teamsData.length === 0) ? true : false}
                content={"Add"}
                onClick={handlePortal}
            />}
        />
    );
}
const _renderUserDialog = (addUsers: any, onDialogCancel: any, isAddUserButtonDisabled: boolean) => {
    return (
        <Dialog
        className="ManageTeamsContainerDialog"
            cancelButton={constants.BtnCancel}
            confirmButton={constants.BtnConfirm}
            closeOnOutsideClick={false}
            onCancel={onDialogCancel}
            onConfirm={addUsers}
            header={constants.AddUserHeader}
            trigger={<Button primary content="Add User(s)" disabled={isAddUserButtonDisabled} />}
        />
    )
}

