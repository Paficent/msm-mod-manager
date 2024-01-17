import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Checkbox,
} from "@material-tailwind/react";

const ModCard = function (props: {
  mod: {
    name: string;
    thumbnail: string;
    description: string;
    author: string;
    version: string;
  };
}) {
  const mod = props.mod;
  const [isChecked, setIsChecked] = useState(false);

  const updateCheckbox = (checkboxKey: string, checkboxState: boolean) => {
    window.ipcRenderer.invoke("checkbox_changed", {
      key: checkboxKey,
      state: checkboxState,
    });
  };

  return (
    <Card
      className="w-50"
      placeholder={""}
      color="gray"
      key={`mod_card_${mod.name}`}
    >
      <CardHeader
        floated={false}
        className="h-65 text-center"
        color="gray"
        placeholder={""}
      >
        <Typography
          variant="h5"
          color="white"
          className="mb-2"
          placeholder={"Unknown Mod"}
        >
          {mod.name}
        </Typography>
        <Typography color="white" className="mb-2" placeholder={""}>
          By {mod.author} (v{mod.version})
        </Typography>
        <img src={mod.thumbnail} alt="Mod Thumbnail" width={250} height={100} />{" "}
      </CardHeader>
      <CardBody className="" placeholder={""}>
        {/* ... (unchanged) */}
        <div className="flex justify-left">
          <Checkbox
            key={`mod_checkbox_${mod.name}`}
            color="blue"
            label="Select"
            crossOrigin={""}
            className=""
            checked={isChecked}
            onChange={() => {
              setIsChecked(!isChecked);
              updateCheckbox(`mod_checkbox_${mod.name}`, !isChecked);
            }}
          ></Checkbox>
        </div>
      </CardBody>
    </Card>
  );
};

export default ModCard;
