import { useState } from "react";
import { Dropdown } from "@fluentui/react-northstar";
import constant from "../../Services/lib/constants.json";

export function SortMyTeams(props: { getSortByOption: any, sortByOption?: string, myTeamsData: any }) {
    const { getSortByOption, sortByOption, myTeamsData } = { ...props }
    const [sortByOptions, getSortByOptions] = useState([constant.SortByOptions.teamAZ, constant.SortByOptions.teamZA]);
    const onSortOptionChanged = (e: any) => {
        let element = e.value;
        getSortByOption({ ...myTeamsData, sortByOption: element });
    }
    return (
        <div className="sortByContainer">
            Sort By{' '}
            <Dropdown
                inline
                items={sortByOptions}
                placeholder={sortByOption}
                onChange={(e, selectedOption) => {
                    onSortOptionChanged(selectedOption)
                }} />
        </div>
    );
}
