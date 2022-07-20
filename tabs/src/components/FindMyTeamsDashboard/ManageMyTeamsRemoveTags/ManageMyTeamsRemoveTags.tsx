import { useState, useEffect } from "react";
import "./ManageMyTeamsRemoveTags.css";
import { Segment, Pill, Text, Skeleton, FlexItem, Flex, Dialog, Button, Input } from "@fluentui/react-northstar";
import { SearchIcon, TagIcon, CheckmarkCircleIcon, CloseIcon } from '@fluentui/react-icons-northstar';
import { UpdateTagsOpenExtension, removeDuplicates } from '../../Services/FindMyTeamsServices/FindMyTeamsServices';
import constants from "../../Services/lib/constants.json";

export function ManageMyTeamsRemoveTags(props: { teamsData: any, manageMyTeamsState: any, getManageMyTeamsState: any, rows: any }) {
    const { teamsData, manageMyTeamsState, getManageMyTeamsState, rows } = { ...props }
    const [tagsSearchValue, getTagsSearchValue] = useState("");
    const [isSearchResults, getSearchResult] = useState(true);
    const [isPortal, togglePortal] = useState(false);
    const [isDialog, toggleDialog] = useState(false);
    const [selectedTags, getSelectedTags] = useState<any>([]);
    const [isTagsLoaded, getIsTagsLoaded] = useState(false);
    const [allRows, getAllRows] = useState<any>(rows)

    let reqTags: any = [];
    teamsData.map((team: any) => {
        reqTags.push(team.tags);
    });

    let allTagsData = removeDuplicates(reqTags.join().split(","));
    const [allTags, getAllTags] = useState(allTagsData);
    const { removeTagsData, removeTagsloading, removeTagserror, removeTagsreload } = UpdateTagsOpenExtension(teamsData, selectedTags.length > 0 && selectedTags);

    useEffect(() => {
        getAllTags(allTagsData);
        getAllRows(rows);
    }, []);

    useEffect(() => {
        let filteredTagData = [];
        if (tagsSearchValue !== "") {
            filteredTagData = [...allTagsData]?.filter((itm: any, idx: number) => {
                return itm.toUpperCase().indexOf(tagsSearchValue) > -1
            });
            getAllTags(filteredTagData);
            (filteredTagData.length === 0) ? getSearchResult(false) : getSearchResult(true);
        }
        else {
            getAllTags(allTagsData);
            getSearchResult(true);
        }
    }, [tagsSearchValue]);

    const onKeyPress = (e: any) => {
        let keyValue = e.target.value;
        if (e.keyCode === 13) {
            getTagsSearchValue(keyValue.toUpperCase());
        }
        if (e.keyCode === 8 && e.target.defaultValue.length == 1) {
            getTagsSearchValue("");
        }

    }
    const onSearchTextDelete = (e: any, data: any) => {
        if (data.value === "") getTagsSearchValue("");
    }
    const removeUsers = () => {
        togglePortal(false);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: false, isAlertVisible: true, alertMessage: constants.AlertMessages.tagRemovedSuccess });
        setTimeout(() => {
            getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: false, isAlertVisible: false });
        }, 3000);
        selectedTags.length > 0 && removeTagsreload();
        updateTableRow();
    }
    const updateTableRow = () => {
        let reqRows = [] as any;
        allRows?.map((row: any) => {
            //update only those rows which are selected
            //if selected tags matches tags from row
            let filteredRows = teamsData.filter((teamData: any) => {
                const selectedTeamsTagsSorted = teamData.tags?.split(",").slice().sort();
                let reqVal = row.tags?.length === teamData.tags?.length && row.tags?.split(",").slice().sort().every(function (value: any, index: number) {
                    return value === selectedTeamsTagsSorted[index];
                });
                return reqVal;

            })
            //If filteredRows is true ,this means selected rows are found
            //inside these selected rows, check for selected tags
            //loop selected rows, if selected tags are found in any row,update that row 
            let updatedTags = [] as any;
            let reqTags = row.tags?.split(",");
            if (filteredRows.length > 0) {
                //update row after deleting selected tags
                if (selectedTags.length > 0) {
                    selectedTags.filter((selectedTag: any) => {
                        let idx = reqTags.indexOf(selectedTag);
                        reqTags.splice(idx, 1);
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
    }
    const onDialogCancel = () => {
        toggleDialog(false);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: true });
    }
    const handlePortal = () => {
        togglePortal(true);
        getManageMyTeamsState({ ...manageMyTeamsState, isPopupOpen: true });
        getAllTags(allTagsData);
        setTimeout(() => {
            getIsTagsLoaded(false);
        }, 500);
        getIsTagsLoaded(true);
    }
    const handleSelectedTags = (e: any, data: any) => {
        getSelectedTags([...selectedTags, e.currentTarget.innerText]);
    };
    return (
        <Dialog
            open={isPortal}
            className="RemoveTableRowsContainer"
            content={
                <div >
                    <Segment inverted color="brand" className="RemoveTableRowsHeader">
                        <Flex gap="gap.small">
                            <TagIcon />
                            <Text content="Remove Tags" className="teamName" align="center" size="medium" weight="bold" />
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
                            content={<>Remove tags from selected teams.</>}
                            size="medium"
                            weight="semibold"
                        />
                        <Input
                            clearable
                            fluid
                            icon={<SearchIcon />}
                            placeholder={constants.SearchTagsPlaceHolder}
                            iconPosition="end"
                            onKeyDown={onKeyPress}
                            onChange={onSearchTextDelete}
                        />
                        <div className="tagsContainer">
                            <div>
                                {_renderUserLabel(handleSelectedTags, isTagsLoaded, allTags === false ? allTagsData : allTags, isSearchResults)}
                            </div>
                        </div>
                        <Flex gap="gap.small" padding="padding.medium" hAlign="end">
                            {_renderUserDialog(removeUsers, onDialogCancel)}
                            <Button secondary onClick={onCancel} content={constants.BtnCancel} />
                        </Flex>
                    </ Segment>
                </div>
            }
            trigger={< Button
                icon={null}
                text
                title={constants.RemoveUsers}
                inverted
                disabled={(teamsData.length === 0) ? true : false}
                content={"Remove Tags"}
                onClick={handlePortal}
            />}
        />
    );
}
const _renderUserDialog = (removeTags: any, onDialogCancel: any) => {
    return (
        <Dialog
            cancelButton={constants.BtnCancel}
            confirmButton={constants.BtnConfirm}
            closeOnOutsideClick={false}
            onCancel={onDialogCancel}
            onConfirm={removeTags}
            header={constants.RemoveTagHeader}
            trigger={<Button primary content="Remove Tag(s)" />}
        />
    )
}
const _renderUserLabel = (handleSelectedTags: any, isTagsLoaded: boolean, tagNames?: any, isSearchResults?: boolean) => {
    let arr = Array.from(Array(25).keys());
    return (
        <>
            {
                isTagsLoaded ?
                    arr.map((element: any) => {
                        return (
                            <Skeleton animation="wave" style={{ width: "7rem", margin: "0.5rem" }}>
                                <div style={{ alignItems: "center", display: "flex", width: "7rem" }}>
                                    <Skeleton.Avatar size="smallest" />
                                    <Skeleton.Text size="smaller" style={{ width: "5rem", marginLeft: "0.5rem" }} />
                                </div>
                            </Skeleton>
                        )
                    })
                    :
                    isSearchResults ?
                        tagNames.map((itm: any) => {
                            if (itm !== "") {
                                return (
                                    <Pill
                                        icon={<TagIcon circular />}
                                        selectedIndicator={<CheckmarkCircleIcon />}
                                        selectable
                                        onSelectionChange={handleSelectedTags}
                                    >
                                        {itm}
                                    </Pill>
                                )
                            }
                        })
                        : <div className="NoTagResultsMessage">Oops!! No Results Found.</div>
            }
        </>
    )

}
