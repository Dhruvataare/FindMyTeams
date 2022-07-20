import { useState, useEffect } from "react";
import "./ManageMyTeamsAddTags.css";
import { Segment, Text, Flex, FlexItem, Button, Dropdown, Dialog } from "@fluentui/react-northstar";
import { CloseIcon, TagIcon } from '@fluentui/react-icons-northstar';
import { CreateOpenExtensionObject, GetAllTags } from '../../Services/FindMyTeamsServices/FindMyTeamsServices';
import constants from "../../Services/lib/constants.json";

export function ManageMyTeamsAddTags(props: { teamsData: any, manageMyTeamsState: any, getManageMyTeamsState: any, rows: any }) {
    const { teamsData, manageMyTeamsState, getManageMyTeamsState, rows } = { ...props }
    const [addTagsState, getAddTagsState] = useState<any>({
        selectedUsers: [],
        selectedUsersToAdd: [],
        selectedTags: [],
        allTags: manageMyTeamsState.allTags?.allTags
    });
    const [isPortal, togglePortal] = useState(false);
    const [isDialog, toggleDialog] = useState(false);
    const [allRows, getAllRows] = useState<any>(rows);
    const { allTagsData, allTagsLoading, allTagsError, allTagsReload } = GetAllTags();

    useEffect(() => {
        getAllRows(rows);
    }, []);
    //post tags to open extension
    const { data, loading, error, reload } = CreateOpenExtensionObject(teamsData, addTagsState.selectedTags.length > 0 && addTagsState.selectedTags)
    const addTagsToTeam = () => {
        addTagsState.selectedTags.length > 0 && reload();
        togglePortal(false);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: false, isAlertVisible: true, alertMessage: constants.AlertMessages.tagAddedSuccess });
        setTimeout(() => {
            getManageMyTeamsState({ ...addTagsState, isPopupOpen: false, isAlertVisible: false });
        }, 3000);
        updateTableRow();
        allTagsReload();
        getAddTagsState({ ...addTagsState, allTags: allTagsData?.tags });
    }

    const updateTableRow = () => {
        let reqRows = [] as any;
        allRows?.map((row: any) => {
            //update only those rows which are selected
            let filteredRows = teamsData.filter((teamData: any) => teamData.id === row.id);
            let updatedTags = [] as any;
            if (filteredRows.length > 0) {
                let reqTags = row.tags?.length > 0 ? row.tags?.split(",") : [];
                //update row after adding selected tags
                if (addTagsState.selectedTags.length > 0) {
                    addTagsState.selectedTags.filter((selectedTag: any) => {
                        let idx;
                        for (let filteredRow of filteredRows) idx = filteredRow.tags?.indexOf(selectedTag);
                        if (idx === -1 || idx === undefined) {
                            reqTags.push(selectedTag);
                        }
                        updatedTags = reqTags;
                    })
                    row["tags"] = updatedTags.toString();
                }
            }
            reqRows.push(row);
        });
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
    };

    const handleSearch = (e: any, data: any) => {
        let selectedTags = data.value;
        getAddTagsState({ ...addTagsState, selectedTags: selectedTags });
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
                <div>
                    <Segment inverted color="brand" className="AddTableRowsHeader">
                        <Flex gap="gap.small">
                            <TagIcon />
                            <Text content="Add Tags" className="teamName" align="center" size="medium" weight="bold" />
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
                        <Text content="Add tags to selected teams." size="medium" weight="semibold" />
                        <Dropdown
                            multiple
                            search
                            fluid
                            items={addTagsState.allTags}
                            placeholder={constants.SearchTagsPlaceHolder}
                            getA11ySelectionMessage={getA11ySelectionMessage}
                            noResultsMessage={constants.NoResultsMessage}
                            a11ySelectedItemsMessage={constants.a11ySelectedItemsMessage}
                            onChange={handleSearch}
                        />
                        <Flex gap="gap.small" padding="padding.medium" hAlign="end">
                            {_renderUserDialog(addTagsToTeam, onDialogCancel)}
                            <Button secondary onClick={onCancel} content={constants.BtnCancel} />
                        </Flex>
                    </Segment>
                </div>
            }
            trigger={<Button
                icon={null}
                text
                title={constants.AddTags}
                inverted
                disabled={(teamsData.length === 0) ? true : false}
                content={"Add Tags"}
                onClick={handlePortal}
            />}
        />
    );
}
const _renderUserDialog = (addTagsToTeam: any, onDialogCancel: any) => {
    return (
        <Dialog
            cancelButton={constants.BtnCancel}
            confirmButton={constants.BtnConfirm}
            closeOnOutsideClick={false}
            onCancel={onDialogCancel}
            onConfirm={addTagsToTeam}
            header={constants.AddTagHeader}
            trigger={<Button primary content="Add Tag(s)" />}
        />
    )
}

