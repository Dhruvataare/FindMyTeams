import './SearchTeams.css'
import { Input } from "@fluentui/react-northstar";
import { SearchIcon } from '@fluentui/react-icons-northstar';
import  constant  from "../../Services/lib/constants.json";

export function SearchTeams(props: { getSearchText: any }) {
    const { getSearchText } = { ...props }
    const onKeyPress = (e: any) => {
        let keyValue = e.target.value;
        if (e.keyCode === 13) {
            getSearchText(keyValue.toUpperCase());
        }
        if (e.keyCode === 8 && e.target.defaultValue.length === 1) {
            getSearchText("");
        }
    }
    const onSearchTextDelete = (e: any, data: any) => {
        if (data.value === "") getSearchText("");
    }
    return (
        <div className="searchTeamsContainer">
            <Input className="searchInput"
                clearable
                fluid={true}
                icon={<SearchIcon />}
                placeholder={constant.SearchTeamsPlaceHolder}
                onKeyDown={onKeyPress}
                onChange={onSearchTextDelete}
            />
        </div>
    );
}
