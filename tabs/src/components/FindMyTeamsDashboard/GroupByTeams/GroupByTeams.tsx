import { useState } from "react";
import { Dropdown } from "@fluentui/react-northstar";
import './GroupByTeams.css';

export function GroupByTeams(props: { getGroupByOption: any, groupByOption?: string, myTeamsData: any }) {
    const { getGroupByOption, groupByOption, myTeamsData } = { ...props }
    const [groupByOptions, getGroupByOptions] = useState(['Tags', 'Clear All']);
    const onGroupOptionChanged = (e: any) => {
        let element = e.value;
        if (element === "Tags") {
            getGroupByOption({ ...myTeamsData, groupByOption: element, hasGroupByOptionsChanged: true, hasSortOptionsChanged: false });
        }
        if (element === "Clear All") {
            getGroupByOption({ ...myTeamsData, groupByOption: "None", hasGroupByOptionsChanged: false, hasSortOptionsChanged: true });
        }

    }
    return (
        <div className="groupByContainer">
            Group By{' '}
            <Dropdown
                inline
                items={groupByOptions}
                value={groupByOption}
                placeholder={groupByOption}
                onChange={(e, selectedOption) => {
                    onGroupOptionChanged(selectedOption)
                }} />
        </div>
    );
}
